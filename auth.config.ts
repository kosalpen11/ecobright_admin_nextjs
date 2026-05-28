import type { NextAuthConfig } from "next-auth";

const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: "/login"
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
      if (session.user && token.id && token.email && token.role) {
        session.user.id = String(token.id);
        session.user.name = token.name ?? "";
        session.user.email = String(token.email);
        session.user.role = token.role as "ADMIN" | "STAFF";
      }

      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;

export default authConfig;
