import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/quiz", "/simulacro", "/repaso", "/agente", "/profile", "/settings"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLogged = !!req.auth;
  const role = req.auth?.user?.role;
  const path = nextUrl.pathname;

  if (AUTH_PAGES.some((p) => path === p) && isLogged) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (PROTECTED.some((p) => path === p || path.startsWith(p + "/")) && !isLogged) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (ADMIN_ONLY.some((p) => path.startsWith(p)) && role !== "admin" && role !== "reviewer") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
