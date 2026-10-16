import { useState } from "react";
import { download } from "./download";
import FileDrop from "./FileDrop";

const presets = [
  { label: "CNIC photo", kb: 200 },
  { label: "Form upload", kb: 500 },
  { label: "Portal limit", kb: 1024 },
];

const toBlob = (canvas, quality) =>
  new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));

async function compress(file, targetKB) {
  const bitmap = await createImageBitmap(file);
  const target = targetKB * 1024;
  let scale = 1;
  let last = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    let lo = 0.3;
    let hi = 0.95;
    let best = null;
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      const blob = await toBlob(canvas, mid);
      last = blob;
      if (blob.size <= target) {
        best = blob;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    if (best) return best;
    scale *= 0.8;
  }
  return last;
}

const fmt = (b) => (b / 1024).toFixed(0) + " KB";

function Compress() {
  const [file, setFile] = useState(null);
  const [kb, setKb] = useState(200);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setResult(await compress(file, kb));
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <FileDrop
        types={["image/png", "image/jpeg"]}
        label={file ? file.name : "Choose a photo"}
        onFiles={([f]) => {
          setFile(f);
          setResult(null);
        }}
      />

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.kb}
            className={kb === p.kb ? "btn-primary" : "btn-ghost"}
            onClick={() => {
              setKb(p.kb);
              setResult(null);
            }}
          >
            {p.label} ({p.kb >= 1024 ? "1 MB" : p.kb + " KB"})
          </button>
        ))}
      </div>

      <button className="btn-primary w-full" onClick={run} disabled={!file || busy}>
        {busy ? "Compressing..." : "Compress"}
      </button>

      {file && result && (
        <div className="fade-up bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <p>
            <span className="text-white/50">{fmt(file.size)}</span>
            {"  →  "}
            <span className="font-bold text-green-400">{fmt(result.size)}</span>
          </p>
          <button className="btn-ghost" onClick={() => download(result, "compressed.jpg", "image/jpeg")}>
            Download image
          </button>
        </div>
      )}
    </div>
  );
}

export default Compress;