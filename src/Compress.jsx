import { useState } from "react";
import { download } from "./download";

const presets = [
  { label: "CNIC photo (200 KB)", kb: 200 },
  { label: "Form upload (500 KB)", kb: 500 },
  { label: "Portal limit (1 MB)", kb: 1024 },
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

function Compress() {
  const [file, setFile] = useState(null);
  const [kb, setKb] = useState(200);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    setResult(await compress(file, kb));
    setBusy(false);
  };

  const fmt = (b) => (b / 1024).toFixed(0) + " KB";

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleSelect}
      />

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.kb}
            onClick={() => {
              setKb(p.kb);
              setResult(null);
            }}
            className={`px-3 py-2 rounded border text-sm ${
              kb === p.kb ? "bg-[var(--brand)] text-white" : "bg-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={run}
        disabled={!file || busy}
        className="bg-[var(--brand)] text-white px-5 py-2 rounded disabled:opacity-40"
      >
        {busy ? "Compressing..." : "Compress"}
      </button>

      {file && result && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {fmt(file.size)} → {fmt(result.size)}
          </p>
          <button
            onClick={() => download(result, "compressed.jpg", "image/jpeg")}
            className="border px-5 py-2 rounded"
          >
            Download image
          </button>
        </div>
      )}
    </div>
  );
}

export default Compress;
