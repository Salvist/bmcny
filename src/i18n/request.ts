import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import * as rootParams from 'next/root-params';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale: override }) => {
    const requested = override ?? await rootParams.locale();
    if (!hasLocale(routing.locales, requested)) {
        notFound();
    }
    const locale = requested;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
        // ...
    };
});
