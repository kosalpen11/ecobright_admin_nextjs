import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const protectedPrefixes = ["/dashboard", "/products", "/categories", "/stock", "/users"];
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/stock/:path*",
    "/users/:path*"
  ]
};
