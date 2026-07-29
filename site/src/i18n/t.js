import { COMMON, PAGES, TITLES } from './strings.js';
import { en as KEYS_EN, ar as KEYS_AR } from './keys.js';

export const LANGS = ['en', 'ar'];
export const DEFAULT_LANG = 'en';

const KEY_MAPS = { en: KEYS_EN, ar: KEYS_AR };

// Page keys in the source data carry a .html suffix; routes do not.
function pageKey(page) {
  return page.endsWith('.html') ? page : `${page}.html`;
}

/**
 * English is the source language, so `text` IS the key. Unknown strings pass
 * through unchanged — a missing translation must degrade to readable English,
 * never to an empty node.
 */
export function t(lang, page, text) {
  if (lang === DEFAULT_LANG) return text;
  const perPage = PAGES[pageKey(page)];
  if (perPage && perPage[text] != null) return perPage[text];
  if (COMMON[text] != null) return COMMON[text];
  return text;
}

/**
 * Key-based lookup for chrome/UI strings sourced from cobras-lib.js's STRINGS
 * map (nav labels, skip link, aria-labels, footer copy, etc.) — a separate,
 * key-keyed data source from COMMON/PAGES/TITLES above, which are keyed by
 * English text. Resolution order: the requested language's entry, then the
 * English entry for that key, then the key itself. Returning the raw key is a
 * last-resort signal that a translation is missing; it must never return an
 * empty string or throw.
 */
export function tk(lang, key) {
  const map = KEY_MAPS[lang];
  if (map && map[key] != null) return map[key];
  if (KEYS_EN[key] != null) return KEYS_EN[key];
  return key;
}

export function title(lang, page) {
  if (lang === DEFAULT_LANG) return null;
  return TITLES[pageKey(page)] ?? null;
}

export function dirFor(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
