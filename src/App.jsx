import { useState } from "react";
import ImagesToPdf from "./ImagesToPdf";
import Merge from "./Merge";
import Split from "./Split";
import { config } from "./config";

const tabs = [
  { id: "images", label: "Images to PDF", view: <ImagesToPdf /> },
  { id: "merge", label: "Merge PDF", view: <Merge /> },
  { id: "split", label: "Split PDF", view: <Split /> },
];

function App() {
  const [tab, setTab] = useState("images");

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-800"
      style={{ "--brand": config.color }}
    >
      <header className="bg-[var(--brand)] text-white p-5 text-center">
        <h1 className="text-2xl font-bold">{config.name}</h1>
        <p className="text-sm opacity-90">{config.tagline}</p>
      </header>

      <main className="max-w-xl mx-auto p-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                tab === t.id
                  ? "bg-[var(--brand)] text-white"
                  : "bg-white border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          {tabs.find((t) => t.id === tab).view}
        </div>
      </main>
    </div>
  );
}

export default App;
