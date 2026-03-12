import { createI18n } from 'vue-i18n';
import fr from '@/locales/app/fr.json';
import en from '@/locales/app/en.json';
import pl from '@/locales/app/pl.json';
import type { Locale } from '@/types';

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'pl'];

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: { fr, en, pl },
});

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale;
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale;
}
