import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  if (isPublicRoute(req)) {
    if (userId) {
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  await auth.protect({
    unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
  });

  if (url.pathname === "/") {
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
