import "i18next";
import { initReactI18next } from "react-i18next";

import nbNo from "./nb-NO.json";
import enUS from "./en-US.json";
import i18next from "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "nbNo";

    resources: {
      nbNo: typeof nbNo;
      enUS: typeof enUS;
    };
  }
}

const resources = {
  nbNo: {
    translation: nbNo,
  },
  enUS: {
    translation: enUS,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: navigator.language.startsWith("nb") ? "nbNo" : "enUS",
  fallbackLng: "enUS",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
