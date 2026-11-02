import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildCsp } from "@/lib/security/csp";

const LOCALES = ["en", "ar"];
const DEFAULT_LOCALE = "en";

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const first = pathname.split("/").filter(Boolean)[0];
  if (LOCALES.includes(first)) return first;
  const accept = request.headers.get("accept-language") ?? "";
  if (accept.toLowerCase().startsWith("ar")) return "ar";
  return DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }
  // Per-request nonce (strict CSP): forwarded as x-nonce so Next.js applies
  // it to framework inline scripts; also enforced on the response.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const first = pathname.split("/").filter(Boolean)[0];
  if (LOCALES.includes(first)) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-nonce", nonce);
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const redirect = NextResponse.redirect(url);
  redirect.headers.set("Content-Security-Policy", csp);
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"],
};
