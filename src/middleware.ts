import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, pathnames, localePrefix, defaultLocale} from './navigation';

const intlMiddleware = createMiddleware({
  defaultLocale,
  localePrefix,
  pathnames,
  locales
});

/***********鉴权中间件功能开始************/
export default function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;

  // 放行：Next 静态资源
  if (pathname.startsWith('/_next')) return intlMiddleware(req);

  // 放行：登录页（含 locale 前缀）
  // 允许：/zh/login 或 /en/login
  const isLoginPage = /^\/(zh|en)\/login\/?$/.test(pathname);
  if (isLoginPage) return intlMiddleware(req);

  // 检查 cookie 登录态
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}/login`;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}
/***********鉴权中间件功能结束************/

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};