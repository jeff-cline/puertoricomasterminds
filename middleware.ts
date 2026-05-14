// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/change-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const { supabase, res } = createMiddlewareClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → only login page is accessible
  if (!user) {
    if (pathname === "/admin/login") return res;
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in: check force_password_change
  const { data: profile } = await (supabase
    .from("users")
    .select("force_password_change, is_active")
    .eq("id", user.id)
    .maybeSingle() as any);

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (profile.force_password_change && pathname !== "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/change-password";
    return NextResponse.redirect(url);
  }

  if (!profile.force_password_change && pathname === "/admin/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Logged-in user visiting /admin/login → bounce to dashboard
  if (pathname === "/admin/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
