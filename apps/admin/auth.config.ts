import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ? String(token.id) : session.user.id;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.role = (token.role as "ADMIN" | "STAFF" | undefined) ?? "STAFF";
      }

      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;

export default authConfig;
