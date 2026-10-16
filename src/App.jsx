import { useState } from "react";
import ImagesToPdf from "./ImagesToPdf";
import Merge from "./Merge";
import Split from "./Split";
import Compress from "./Compress";
import { config } from "./config";

const tabs = [
  { id: "images", icon: "🖼️", label: "Images to PDF", view: <ImagesToPdf /> },
  { id: "merge", icon: "🔗", label: "Merge PDF", view: <Merge /> },
  { id: "split", icon: "✂️", label: "Split PDF", view: <Split /> },
  { id: "compress", icon: "🗜️", label: "Compress Image", view: <Compress /> },
];

const perks = [
  { icon: "🔒", title: "100% Private", text: "Files never leave your device" },
  { icon: "⚡", title: "Instant", text: "No upload, no waiting" },
  { icon: "📴", title: "Works Offline", text: "Install it like an app" },
  { icon: "🎁", title: "Free", text: "No signup, no watermark" },
];

function App() {
  const [tab, setTab] = useState("images");

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ "--brand": config.color, "--brand2": config.color2 }}
    >
      <div className="blob w-96 h-96 bg-[var(--brand)] -top-20 -left-20" />
      <div className="blob w-96 h-96 bg-[var(--brand2)] bottom-0 -right-20" style={{ animationDelay: "-6s" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <header className="text-center mb-10 fade-up">
          <h1 className="text-4xl sm:text-6xl font-extrabold gradient-text">{config.name}</h1>
          <p className="mt-3 text-white/60 max-w-lg mx-auto">{config.tagline}</p>
        </header>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 justify-start sm:justify-center">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <main key={tab} className="glass p-5 sm:p-7 fade-up">
          {tabs.find((t) => t.id === tab).view}
        </main>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
          {perks.map((p) => (
            <div key={p.title} className="glass p-4 text-center hover:-translate-y-1 transition">
              <div className="text-2xl">{p.icon}</div>
              <p className="font-semibold mt-1">{p.title}</p>
              <p className="text-xs text-white/50 mt-1">{p.text}</p>
            </div>
          ))}
        </section>

        <footer className="text-center text-white/30 text-sm mt-10">
          © {new Date().getFullYear()} {config.name}
        </footer>
      </div>
    </div>
  );
}

export default App;