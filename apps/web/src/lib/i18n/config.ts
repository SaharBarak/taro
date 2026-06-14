// Hebrew-only site. `locales` (runtime routing) is locked to ['he'].
// The Locale TYPE intentionally still includes 'en' so the many existing
// `locale === 'en' ? ... : ...` copy ternaries keep compiling; their English
// branches are simply unreachable now (no /en route, no language toggle).
export const i18n = {
  defaultLocale: 'he',
  locales: ['he'],
} as const;

export type Locale = 'he' | 'en';

export const localeNames: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  he: 'rtl',
  en: 'ltr',
};
