import { createI18n } from 'vue-i18n';
import en from '@/locales/app/en.json';
import fr from '@/locales/app/fr.json';
import pl from '@/locales/app/pl.json';
import type { Locale } from '@/types';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'pl'];

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en, pl },
  pluralizationRules: {
    pl: (choice: number) => {
      if (choice === 0) return 2;
      if (choice === 1) return 0;
      const teen = choice % 100 > 10 && choice % 100 < 20;
      const endsWith = choice % 10;
      if (!teen && endsWith > 1 && endsWith < 5) return 1;
      return 2;
    },
  },
});

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale;
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale;
}
