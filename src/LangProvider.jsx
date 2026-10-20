import { useEffect, useState } from "react";
import { dict, LangContext } from "./i18n";

function LangProvider({ children }) {
    const [lang, setLang] = useState(() => {
        try {
            return localStorage.getItem("lang") || "en";
        } catch {
            return "en";
        }
    });

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
        try {
            localStorage.setItem("lang", lang);
        } catch {
            /* ignore */
        }
    }, [lang]);

    const t = (key, vars = {}) => {
        let s = dict[lang]?.[key] ?? dict.en[key] ?? key;
        for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
        return s;
    };

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    );
}

export default LangProvider;