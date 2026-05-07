import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Пропускаем:
     * 1. api (ручки API)
     * 2. _next/static (статические файлы: JS, CSS)
     * 3. _next/image (оптимизация изображений)
     * 4. Файлы с расширениями: svg, png, jpg, jpeg, gif, webp, ico, csv, docx, pdf, zip
     */
    '/((?!api|_next/static|_next/image|auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|docx|pdf|zip)$).*)',
  ],
};
