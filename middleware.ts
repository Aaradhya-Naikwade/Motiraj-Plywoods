import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, VENDOR_AUTH_COOKIE } from "@/lib/auth-cookies";

const ADMIN_LOGIN_PATH = "/admin";
const ADMIN_DASHBOARD_PATH = "/admin/dashboard";
const VENDOR_AUTH_PATH = "/vendor/auth";
const VENDOR_SIGNUP_PATH = "/vendor/signup";
const VENDOR_DASHBOARD_PATH = "/vendor/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminAuthenticated = Boolean(request.cookies.get(ADMIN_AUTH_COOKIE)?.value);
  const isVendorAuthenticated = Boolean(request.cookies.get(VENDOR_AUTH_COOKIE)?.value);

  if (pathname.startsWith(ADMIN_DASHBOARD_PATH) && !isAdminAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`) && isAdminAuthenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = ADMIN_DASHBOARD_PATH;
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith(VENDOR_DASHBOARD_PATH) && !isVendorAuthenticated) {
    const vendorLoginUrl = request.nextUrl.clone();
    vendorLoginUrl.pathname = VENDOR_AUTH_PATH;
    return NextResponse.redirect(vendorLoginUrl);
  }

  if (
    (pathname === VENDOR_AUTH_PATH ||
      pathname === `${VENDOR_AUTH_PATH}/` ||
      pathname === VENDOR_SIGNUP_PATH ||
      pathname === `${VENDOR_SIGNUP_PATH}/`) &&
    isVendorAuthenticated
  ) {
    const vendorDashboardUrl = request.nextUrl.clone();
    vendorDashboardUrl.pathname = VENDOR_DASHBOARD_PATH;
    return NextResponse.redirect(vendorDashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/vendor"],
};
