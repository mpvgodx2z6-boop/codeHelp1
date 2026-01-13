import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './navigation';

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale = (locale ?? defaultLocale) as any;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(resolvedLocale)) notFound();

  const now = headers().get('x-now');
  const timeZone = headers().get('x-time-zone') ?? 'Europe/Vienna';
  const messages = (await import(`../messages/${resolvedLocale}.json`)).default;

  return {
    // 关键：必须返回 locale，否则 next-intl 未来会报错
    locale: resolvedLocale,
    now: now ? new Date(now) : undefined,
    timeZone,
    messages,
    defaultTranslationValues: {
      globalString: 'Global string',
      highlight: (chunks: any) => <strong>{chunks}</strong>
    },
    formats: {
      dateTime: {
        medium: {
          dateStyle: 'medium',
          timeStyle: 'short',
          hour12: false
        }
      }
    },
    onError(error: any) {
      if (
        error.message ===
        (process.env.NODE_ENV === 'production'
          ? 'MISSING_MESSAGE'
          : 'MISSING_MESSAGE: Could not resolve `missing` in `Index`.')
      ) {
        // Do nothing, this error is triggered on purpose
      } else {
        console.error(JSON.stringify(error.message));
      }
    },
    getMessageFallback({key, namespace}: any) {
      return (
        '`getMessageFallback` called for ' +
        [namespace, key].filter((part) => part != null).join('.')
      );
    }
  };
});