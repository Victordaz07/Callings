import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Auth real multiusuario sobre Prisma. NextAuth solo autentica y expone la
 * sesión — nunca deriva ni maneja la clave de cifrado E2EE, eso ocurre en
 * el cliente después del login (lib/crypto.ts, Bloque 3).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, kdfSalt: user.kdfSalt };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.kdfSalt = user.kdfSalt;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email!;
      session.user.kdfSalt = token.kdfSalt;
      return session;
    },
  },
});
