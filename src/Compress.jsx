import { useState } from "react";
import { download } from "./download";
import FileDrop from "./FileDrop";
import { Choice, Field } from "./ui";

const toBlob = (canvas, quality) =>
  new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));

async function compress(file, targetKB) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
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
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["image/png", "image/jpeg"]}
        label={file ? file.name : "Choose a photo"}
        onFiles={([f]) => {
          setFile(f);
          setResult(null);
        }}
      />

      <Field label="Target size">
        <Choice
          value={kb}
          onChange={(v) => {
            setKb(v);
            setResult(null);
          }}
          options={[[200, "CNIC 200 KB"], [500, "Form 500 KB"], [1024, "Portal 1 MB"]]}
        />
      </Field>

      <div>
        <span className="label">Or type your own size (KB)</span>
        <input
          type="number"
          className="input"
          style={{ width: 140 }}
          min="20"
          value={kb}
          onChange={(e) => {
            setKb(Number(e.target.value));
            setResult(null);
          }}
        />
      </div>

      <button className="btn" onClick={run} disabled={!file || busy || kb < 20}>
        {busy ? "Compressing..." : "Compress"}
      </button>

      {file && result && (
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", padding: 14 }}>
          <span>
            {fmt(file.size)} → <b>{fmt(result.size)}</b>
          </span>
          <button
            className="btn btn-sm"
            onClick={() => download(result, "compressed.jpg", "image/jpeg")}
          >
            Download image
          </button>
        </div>
      )}
    </div>
  );
}

export default Compress;