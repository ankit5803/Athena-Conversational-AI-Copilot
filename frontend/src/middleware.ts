import {
  clerkMiddleware,
  ClerkMiddlewareAuth,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
const isProtectedRoute = createRouteMatcher("/chat"); // Add protected routes here, such as /dashboardexport default
export default clerkMiddleware(
  async (auth: ClerkMiddlewareAuth, req) => {
    const { isAuthenticated } = await auth();
    // console.log("isAuthenticated", isAuthenticated);
    if (!isAuthenticated && isProtectedRoute(req)) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to the home page if not authenticated
    }
    if (isAuthenticated && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/chat", req.url)); // Redirect to the chat page if authenticated
    }
    return NextResponse.next();
  }
  // { debug: true }
);
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
