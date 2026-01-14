import { createLocalizedPathnamesNavigation, Pathnames } from 'next-intl/navigation';

export const defaultLocale = 'zh';

export const locales = ['en', 'zh'] as const;

export const localePrefix = process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

export const pathnames = {
    '/': '/',
    '/login': '/login',
    '/dashboard': '/dashboard',
    '/projects': '/projects',
    '/standards': '/standards',
    '/modules': '/modules',
    '/changes': '/changes',
    '/tests': '/tests',
    '/prompts': '/prompts',
    '/templates': '/templates',
    '/builder': '/builder',
    '/export': '/export'
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } = createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames
});
