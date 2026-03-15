import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const authPages = new Set(["/sign-in", "/sign-up", "/forgot-password", "/reset-password"]);
const protectedPrefixes = ["/dashboard", "/onboarding", "/profile", "/resumes", "/applications", "/cover-letters", "/settings"];

export default withAuth(
  function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;
    const isAuthPage = authPages.has(pathname);
    const isProtectedPath = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (isAuthPage && token) {
      const target = token.onboardedAt ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (!token && isProtectedPath) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (token && !token.onboardedAt && pathname !== "/onboarding" && isProtectedPath) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (token && token.onboardedAt && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/dashboard/:path*", "/onboarding/:path*", "/profile/:path*", "/resumes/:path*", "/applications/:path*", "/cover-letters/:path*", "/settings/:path*"],
};
