import 'server-only'; 

const dictionaries = {
  en: () => import('./en').then((module) => module.en),
  th: () => import('./th').then((module) => module.th),
};

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en();
};