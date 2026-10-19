import { useEffect, useState } from "react";
import ImagesToPdf from "./ImagesToPdf";
import Merge from "./Merge";
import Split from "./Split";
import Pages from "./Pages";
import Stamp from "./Stamp";
import Compress from "./Compress";
import BrandPanel from "./BrandPanel";
import { Icon, Tile } from "./Icons";
import { useBrand } from "./brand";
import { config } from "./config";

const tabs = [
  { id: "images", icon: "images", label: "Images to PDF", desc: "Turn photos into a clean A4 PDF.", view: <ImagesToPdf /> },
  { id: "merge", icon: "merge", label: "Merge PDF", desc: "Combine several PDFs into one file.", view: <Merge /> },
  { id: "split", icon: "split", label: "Split PDF", desc: "Extract only the pages you need.", view: <Split /> },
  { id: "pages", icon: "trash", label: "Delete Pages", desc: "Remove pages or reverse the order.", view: <Pages /> },
  { id: "stamp", icon: "text", label: "Text & Stamp", desc: "Add text, watermark or page numbers.", view: <Stamp /> },
  { id: "compress", icon: "compress", label: "Compress Image", desc: "Reduce photo size to meet upload limits.", view: <Compress /> },
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
  const [tab, setTab] = useState("images");
  const [theme, setTheme] = useTheme();
  const [toast, setToast] = useState("");
  const { brand, save, reset } = useBrand();
  const admin = new URLSearchParams(window.location.search).has("admin");
  const active = tabs.find((t) => t.id === tab);
  const isDefault = brand.name === config.name;

  useEffect(() => {
    document.title = brand.name || "PDF Tools";
  }, [brand]);

  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setToast(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(""), 3500);
    };
    window.addEventListener("toast", onToast);
    return () => {
      window.removeEventListener("toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  const waLink = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
    "Hi, I saw your PDF tool and want one for my business."
  )}`;

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
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span key={theme} className="spin-in">
              <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
            </span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px 40px" }}>
        {admin && <BrandPanel brand={brand} save={save} reset={reset} />}

        <section style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15 }}>
            Every PDF tool you need.
            <br />
            Private by design.
          </h1>
          <p className="note" style={{ margin: "12px auto 0", maxWidth: 460, fontSize: 15 }}>
            {brand.tagline}
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
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tool ${tab === t.id ? "on" : ""}`}
            >
              <Tile name={t.icon} size={44} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="card">
          <div key={tab} className="swap">
            <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
              <Tile name={active.icon} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{active.label}</div>
                <div className="note">{active.desc}</div>
              </div>
            </div>
            {active.view}
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Your files stay with you</div>
          <p className="note" style={{ margin: "6px 0 0", fontSize: 14 }}>
            Everything happens inside your browser. Your documents are never uploaded to any
            server, so nobody else can see them.
          </p>
        </div>

        {isDefault && config.whatsapp && (
          <div className="card" style={{ marginTop: 18, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              Want this tool with your business name?
            </div>
            <p className="note" style={{ margin: "6px 0 14px", fontSize: 14 }}>
              Academies, clinics, shops and offices. Your own private PDF tool.
            </p>
            <a className="btn wa" href={waLink} target="_blank" rel="noreferrer">
              Order on WhatsApp
            </a>
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;