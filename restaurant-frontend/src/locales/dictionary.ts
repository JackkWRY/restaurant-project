/**
 * @file Dictionary Loader
 * @description Server-side dictionary loader for i18n
 * 
 * This module provides:
 * - Async dictionary loading
 * - Type-safe dictionary exports
 * - Locale fallback to English
 * 
 * @module locales/dictionary
 * @requires server-only
 * @requires ./en
 * @requires ./th
 * 
 * @see {@link en} for English translations
 * @see {@link th} for Thai translations
 */

import 'server-only';
import en from './en';

const dictionaries = {
  en: () => import('./en').then((module) => module.default),
  th: () => import('./th').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const getDict = dictionaries[locale as keyof typeof dictionaries] || dictionaries.en;
  return getDict();
};

export type Dictionary = typeof en;