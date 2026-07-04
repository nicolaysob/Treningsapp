import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Brukernavn", type: "text" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!username || !password) return null;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, image: user.image };
      },
    }),
  ],
  // Credentials-based sign-in has no adapter-backed database session, so the
  // user id is carried in the signed JWT instead.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.sub) return session;

      session.user.id = token.sub;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { name: true, image: true, username: true },
      });

      if (dbUser) {
        session.user.name = dbUser.name;
        session.user.image = dbUser.image;
        session.user.username = dbUser.username;
      }

      return session;
    },
  },
});
