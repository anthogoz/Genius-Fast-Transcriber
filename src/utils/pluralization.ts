import type { Locale } from '@/types';

/**
 * Returns the plural form index for a given count and locale.
 * Polish has 3 forms: singular (1), paucal (2-4, 22-24...), plural (5-21, 25-31...).
 * French: 0/1 singular, 2+ plural. English: 1 singular, 0/2+ plural.
 */
export function getPluralForm(count: number, locale: Locale): number {
  const c = Math.abs(count);
  if (locale === 'pl') {
    if (c === 1) return 0;
    if (c % 10 >= 2 && c % 10 <= 4 && (c % 100 < 12 || c % 100 > 14)) return 1;
    return 2;
  }
  if (locale === 'fr') return c > 1 ? 1 : 0;
  return c === 1 ? 0 : 1;
}

export function formatListWithConjunction(items: string[], locale: Locale): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  if (typeof Intl !== 'undefined' && Intl.ListFormat) {
    try {
      const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
      return formatter.format(items);
    } catch {
      // fall through to manual join
    }
  }

  const itemsCopy = [...items];
  const lastItem = itemsCopy.pop()!;
  const conjunctions: Record<Locale, string> = {
    fr: ' et ',
    en: ' and ',
    pl: ' i ',
  };
  const conj = conjunctions[locale];
  return itemsCopy.join(', ') + conj + lastItem;
}
