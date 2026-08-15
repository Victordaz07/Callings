import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      kdfSalt: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    kdfSalt: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    kdfSalt: string;
  }
}
