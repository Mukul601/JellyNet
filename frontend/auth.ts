import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, trigger, session }: any) {
      const BACKEND = process.env.NEXTAUTH_BACKEND_URL ?? "http://localhost:8001";

      // On first sign-in, exchange Google id_token for our backend JWT
      if (account?.id_token) {
        try {
          const res = await fetch(`${BACKEND}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
          });
          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.access_token;
            token.userId = data.user_id;
            token.hasWallet = data.has_wallet;
            token.walletAddress = data.wallet_address ?? null;
            token.walletIsGenerated = data.wallet_is_generated ?? false;
            token.walletSyncAt = Date.now();
          }
        } catch {
          // Backend may not be running during build — token stays minimal
        }
      }

      // Handle updateSession() calls from client (wallet setup, etc.)
      if (trigger === "update" && session) {
        if (session.hasWallet !== undefined) token.hasWallet = session.hasWallet;
        if (session.walletAddress !== undefined) token.walletAddress = session.walletAddress;
        if (session.walletIsGenerated !== undefined) token.walletIsGenerated = session.walletIsGenerated;
        token.walletSyncAt = Date.now();
      }

      // Re-sync wallet status from backend every 60 seconds (catches stale sessions)
      const now = Date.now();
      const lastSync = (token.walletSyncAt as number) ?? 0;
      if (token.backendToken && now - lastSync > 60_000) {
        try {
          const res = await fetch(`${BACKEND}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token.backendToken}` },
          });
          if (res.ok) {
            const me = await res.json();
            token.hasWallet = me.has_wallet;
            token.walletAddress = me.wallet_address ?? null;
            token.walletIsGenerated = me.wallet_is_generated ?? false;
            token.walletSyncAt = now;
          }
        } catch {
          // Backend unavailable — keep existing token values
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken as string;
      session.userId = token.userId as string;
      session.hasWallet = token.hasWallet as boolean;
      session.walletAddress = token.walletAddress as string | null;
      session.walletIsGenerated = token.walletIsGenerated as boolean;
      return session;
    },
  },
});
