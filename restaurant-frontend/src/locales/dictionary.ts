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