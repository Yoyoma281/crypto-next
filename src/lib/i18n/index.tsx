'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, Locale, T, RTL_LOCALES } from './translations';

interface I18nCtx { locale: Locale; setLocale: (l: Locale) => void; t: T; dir: 'ltr' | 'rtl'; }

const Ctx = createContext<I18nCtx>({ locale: 'en', setLocale: () => {}, t: translations.en, dir: 'ltr' });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && saved in translations) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale, dir]);

  return (
    <Ctx.Provider value={{ locale, setLocale, t: translations[locale], dir }}>
      {children}
    </Ctx.Provider>
  );
}

export const useI18n = () => useContext(Ctx);
