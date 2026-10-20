import { useEffect, useState } from "react";
import ImagesToPdf from "./ImagesToPdf";
import Merge from "./Merge";
import Split from "./Split";
import Organize from "./Organize";
import Stamp from "./Stamp";
import Compress from "./Compress";
import BrandPanel from "./BrandPanel";
import { Icon, Tile } from "./Icons";
import { useBrand } from "./brand";
import { useT } from "./i18n";
import { config } from "./config";

const TABS = [
  { id: "images", icon: "images", view: <ImagesToPdf /> },
  { id: "merge", icon: "merge", view: <Merge /> },
  { id: "split", icon: "split", view: <Split /> },
  { id: "organize", icon: "grid", view: <Organize /> },
  { id: "stamp", icon: "text", view: <Stamp /> },
  { id: "compress", icon: "compress", view: <Compress /> },
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return [theme, setTheme];
}

function App() {
  const { t, lang, setLang } = useT();
  const [tab, setTab] = useState("images");
  const [theme, setTheme] = useTheme();
  const [toast, setToast] = useState("");
  const { brand, save, reset } = useBrand();
  const admin = new URLSearchParams(window.location.search).has("admin");
  const active = TABS.find((x) => x.id === tab);
  const isDefault = brand.name === config.name;
  const tagline =
    lang === "ur" && brand.tagline === config.tagline ? t("tagline") : brand.tagline;

  useEffect(() => {
    document.title = brand.name || "PDF Tools";
  }, [brand]);

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setToast(t("ready", e.detail));
      clearTimeout(timer);
      timer = setTimeout(() => setToast(""), 3500);
    };
    window.addEventListener("toast", onToast);
    return () => {
      window.removeEventListener("toast", onToast);
      clearTimeout(timer);
    };
  });

  const waLink = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(t("waMsg"))}`;

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div
          style={{ maxWidth: 820, margin: "0 auto", padding: "14px 16px" }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Tile name="logo" size={40} />
            <span style={{ fontSize: 20, fontWeight: 800 }}>{brand.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="icon-btn lang-btn"
              aria-label="Language"
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
            >
              {lang === "en" ? "اردو" : "EN"}
            </button>
            <button
              className="icon-btn"
              aria-label="Toggle theme"
              title={theme === "dark" ? t("toLight") : t("toDark")}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span key={theme} className="spin-in">
                <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px 40px" }}>
        {admin && <BrandPanel brand={brand} save={save} reset={reset} />}

        <section style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.25 }}>
            {t("hero1")}
            <br />
            {t("hero2")}
          </h1>
          <p className="note" style={{ margin: "12px auto 0", maxWidth: 460, fontSize: 15 }}>
            {tagline}
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {TABS.map((x) => (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              className={`tool ${tab === x.id ? "on" : ""}`}
            >
              <Tile name={x.icon} size={44} />
              {t(x.id)}
            </button>
          ))}
        </div>

        <div className="card">
          <div key={tab + lang} className="swap">
            <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
              <Tile name={active.icon} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{t(active.id)}</div>
                <div className="note">{t(active.id + "Desc")}</div>
              </div>
            </div>
            {active.view}
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{t("privacyTitle")}</div>
          <p className="note" style={{ margin: "6px 0 0", fontSize: 14 }}>
            {t("privacyText")}
          </p>
        </div>

        {isDefault && config.whatsapp && (
          <div className="card" style={{ marginTop: 18, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{t("orderTitle")}</div>
            <p className="note" style={{ margin: "6px 0 14px", fontSize: 14 }}>
              {t("orderText")}
            </p>
            <a className="btn wa" href={waLink} target="_blank" rel="noreferrer">
              {t("orderBtn")}
            </a>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;