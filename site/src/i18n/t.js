import { COMMON, PAGES, TITLES } from './strings.js';

export const LANGS = ['en', 'ar'];
export const DEFAULT_LANG = 'en';

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

export function title(lang, page) {
  if (lang === DEFAULT_LANG) return null;
  return TITLES[pageKey(page)] ?? null;
}

export function dirFor(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
