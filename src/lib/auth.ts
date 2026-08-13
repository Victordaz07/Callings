import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/**
 * Single-user auth: the app belongs to whoever holds the passcode configured
 * in APP_PASSCODE_HASH. Email is only used to namespace stored data, so it
 * can grow into multi-user later without changing the storage shape.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        passcode: { label: "Código de acceso", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const passcode = String(credentials?.passcode ?? "");
        const ownerEmail = (process.env.APP_OWNER_EMAIL ?? "")
          .trim()
          .toLowerCase();
        const passcodeHash = process.env.APP_PASSCODE_HASH ?? "";

        if (!ownerEmail || !passcodeHash) {
          throw new Error(
            "Auth no configurada: define APP_OWNER_EMAIL y APP_PASSCODE_HASH."
          );
        }
        if (!email || !passcode || email !== ownerEmail) return null;

        const valid = await bcrypt.compare(passcode, passcodeHash);
        if (!valid) return null;

        return { id: email, email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    session({ session, token }) {
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
});
