import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../i18n';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('stea_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  
  const [language, setLanguage] = useState(() => {
    try {
      const isExplicit = localStorage.getItem("stea_lang_explicit");
      if (isExplicit === "true") {
        return localStorage.getItem('stea_lang') || 'en';
      }
      return 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stea_theme', theme);
    } catch (e) {
      console.warn("localStorage not available", e);
    }
    
    const systemIsLight = () =>
      window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false;

    const applyTheme = (isLight) => {
      const root = document.documentElement;
      root.classList.toggle('light-mode', isLight);
      root.classList.toggle('dark', !isLight);   // makes Tailwind `dark:` follow the app
      root.style.colorScheme = isLight ? 'light' : 'dark';
    };

    applyTheme(theme === 'light' || (theme === 'system' && systemIsLight()));

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('stea_lang', language);
    } catch (e) {
      console.warn("localStorage not available", e);
    }
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => getTranslation(language, key);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
