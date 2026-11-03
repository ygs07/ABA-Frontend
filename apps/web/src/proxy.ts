import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CUSTOMER_ROLE = 'Customer';

/**
 * Optimistically guards private application shells. The backend remains the
 * authority for validating tokens and permissions on every API request.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('aba_auth_token')?.value;
  const role = request.cookies.get('aba_auth_role')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    role === CUSTOMER_ROLE &&
    (request.nextUrl.pathname.startsWith('/erp') ||
      request.nextUrl.pathname.startsWith('/pos'))
  ) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/erp/:path*', '/portal/:path*', '/pos/:path*'],
};
