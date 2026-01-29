import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');
  const user = request.cookies.get('user');

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isStudentPage = request.nextUrl.pathname.startsWith('/student');

  // If not logged in and trying to access protected routes
  if (!accessToken && (isAdminPage || isStudentPage)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If logged in and trying to access auth pages
  if (accessToken && isAuthPage) {
    if (user) {
      try {
        const userData = JSON.parse(user.value);
        if (userData.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else {
          return NextResponse.redirect(new URL('/student', request.url));
        }
      } catch (error) {
        // If parsing fails, allow access to auth page
      }
    }
  }

  // Role-based access control
  if (user) {
    try {
      const userData = JSON.parse(user.value);

      // Admins can access both admin and student pages (for testing/preview)
      // Only restrict students from accessing admin pages

      // Student trying to access admin pages
      if (userData.role === 'STUDENT' && isAdminPage) {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    } catch (error) {
      // If parsing fails, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/auth/:path*'],
};
