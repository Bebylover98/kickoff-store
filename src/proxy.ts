import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export default async function proxy(req: any) {
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/orders')
  ) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: req.nextUrl.protocol === 'https:',
    });
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*', '/orders/:path*'],
};
