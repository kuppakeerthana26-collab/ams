import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations } from "../i18n/translations.js";

const STORAGE_KEY_LANGUAGE = "@gkce_parent_language";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("te"); // 'en' | 'te' | 'ta'
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_LANGUAGE);
        if (saved === "en" || saved === "te" || saved === "ta") {
          setLanguageState(saved);
        } else {
          setLanguageState("te");
        }
      } catch (err) {
        console.error("[LanguageContext] Failed to load language:", err);
      } finally {
        setIsLanguageLoaded(true);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (newLang) => {
    if (newLang !== "en" && newLang !== "te" && newLang !== "ta") return;
    try {
      setLanguageState(newLang);
      await AsyncStorage.setItem(STORAGE_KEY_LANGUAGE, newLang);
    } catch (err) {
      console.error("[LanguageContext] Failed to save language:", err);
    }
  };

  /**
   * Helper translation function
   */
  const t = (key, params = {}) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (typeof text === "string" && params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), params[paramKey]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isLanguageLoaded,
        setLanguage,
        t,
        isTelugu: language === "te",
        isEnglish: language === "en",
        isTamil: language === "ta",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
