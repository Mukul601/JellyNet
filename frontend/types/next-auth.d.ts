import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    userId?: string;
    hasWallet?: boolean;
    walletAddress?: string | null;
    walletIsGenerated?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    userId?: string;
    hasWallet?: boolean;
    walletAddress?: string | null;
    walletIsGenerated?: boolean;
  }
}
