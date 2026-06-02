import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const ADMIN_HOSTS = new Set(["admin.bmcny.com", "admin.localhost"]);

function getHostname(request: NextRequest) {
  return (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

function isAdminHost(request: NextRequest) {
  return ADMIN_HOSTS.has(getHostname(request));
}

function getCleanAdminPath(pathname: string) {
  if (pathname === "/admin") return "/";
  if (pathname.startsWith("/admin/")) return pathname.slice("/admin".length);
  return null;
}

function getAdminRewritePath(pathname: string) {
  if (pathname === "/") return "/admin";
  if (pathname === "/login" || pathname.startsWith("/events/")) {
    return `/admin${pathname}`;
  }

  return null;
}

async function refreshAdminSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminHost(request)) {
    const cleanAdminPath = getCleanAdminPath(pathname);

    if (cleanAdminPath) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = cleanAdminPath;
      return NextResponse.redirect(cleanUrl);
    }

    const rewritePath = getAdminRewritePath(pathname);

    if (!rewritePath) {
      return new NextResponse(null, { status: 404 });
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;
    return refreshAdminSession(request, NextResponse.rewrite(rewriteUrl));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
