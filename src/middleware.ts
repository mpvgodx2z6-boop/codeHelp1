import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, pathnames, localePrefix, defaultLocale} from './navigation';

const intlMiddleware = createMiddleware({
  defaultLocale,
  localePrefix,
  pathnames,
  locales
});

export default function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // 先让 next-intl 处理（保持原逻辑）
  const res = (() => {
    // 1) 放行静态资源
    if (pathname.startsWith('/_next')) return intlMiddleware(req);

    // 2) 放行未国际化的 login 入口
    if (pathname === '/login' || pathname === '/login/') return intlMiddleware(req);

    // 3) 放行国际化 login 页
    if (/^\/(zh|en)\/login\/?$/.test(pathname)) return intlMiddleware(req);

    // 4) 鉴权
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${defaultLocale}/login`;
      url.search = '';
      return NextResponse.redirect(url);
    }

    return intlMiddleware(req);
  })();

  // ✅ 用于确认 middleware 生效（浏览器 Network 里能看到）
  res.headers.set('x-mw', '1');
  res.headers.set('x-mw-path', pathname);
  return res;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};