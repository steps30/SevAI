import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, translateStatusLabel } from "../i18n/translations";

const LanguageContext = createContext(null);

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    document.documentElement.setAttribute("lang", language === "ta" ? "ta" : "en");
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    text: translations[language],
    translateStatus: (status) => translateStatusLabel(status, language),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export { LanguageProvider, useLanguage };