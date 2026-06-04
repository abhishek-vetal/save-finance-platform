import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/about(.*)",
  "/transactions(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/api/inngest(.*)", // ← add this
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return; // ← add this

  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated && isProtectedRoute(req)) {
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
