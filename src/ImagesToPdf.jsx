import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import FileDrop from "./FileDrop";
import FileList from "./FileList";

const A4 = [595.28, 841.89];

function ImagesToPdf() {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState("fit");
  const [busy, setBusy] = useState(false);

  const makePDF = async () => {
    setBusy(true);
    const pdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const img =
        file.type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);

      if (mode === "a4") {
        const page = pdf.addPage(A4);
        const m = 24;
        const s = Math.min((A4[0] - 2 * m) / img.width, (A4[1] - 2 * m) / img.height);
        const w = img.width * s;
        const h = img.height * s;
        page.drawImage(img, { x: (A4[0] - w) / 2, y: (A4[1] - h) / 2, width: w, height: h });
      } else {
        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
    }
    download(await pdf.save(), "images.pdf");
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <FileDrop
        types={["image/png", "image/jpeg"]}
        multiple
        label="Add photos (JPG / PNG)"
        onFiles={(f) => setFiles([...files, ...f])}
      />
      <FileList files={files} setFiles={setFiles} />

      <div className="flex gap-2">
        <button
          className={mode === "fit" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("fit")}
        >
          Fit to image
        </button>
        <button
          className={mode === "a4" ? "btn-primary" : "btn-ghost"}
          onClick={() => setMode("a4")}
        >
          A4 page
        </button>
      </div>

      <button className="btn-primary w-full" onClick={makePDF} disabled={!files.length || busy}>
        {busy ? "Creating..." : `Create PDF (${files.length})`}
      </button>
    </div>
  );
}

export default ImagesToPdf;