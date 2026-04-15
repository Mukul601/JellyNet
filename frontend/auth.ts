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
    async jwt({ token, account }) {
      // On first sign-in, exchange Google id_token for our backend JWT
      if (account?.id_token) {
        try {
          const res = await fetch(
            `${process.env.NEXTAUTH_BACKEND_URL ?? "http://localhost:8000"}/api/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: account.id_token }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.access_token;
            token.userId = data.user_id;
            token.hasWallet = data.has_wallet;
            token.walletAddress = data.wallet_address ?? null;
            token.walletIsGenerated = data.wallet_is_generated ?? false;
          }
        } catch {
          // Backend may not be running during build — token stays minimal
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken as string | undefined;
      session.userId = token.userId as string | undefined;
      session.hasWallet = token.hasWallet as boolean | undefined;
      session.walletAddress = token.walletAddress as string | null | undefined;
      session.walletIsGenerated = token.walletIsGenerated as boolean | undefined;
      return session;
    },
  },
});
