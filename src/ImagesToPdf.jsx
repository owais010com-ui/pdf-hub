import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";

function ImagesToPdf() {
  const [files, setFiles] = useState([]);

  const handleSelect = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const makePDF = async () => {
    const pdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const img =
        file.type === "image/png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    download(await pdf.save(), "images.pdf");
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/png, image/jpeg"
        multiple
        onChange={handleSelect}
      />
      <ul className="text-sm text-gray-600 list-disc pl-5">
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
      <button
        onClick={makePDF}
        disabled={files.length === 0}
        className="bg-[var(--brand)] text-white px-5 py-2 rounded disabled:opacity-40"
      >
        Create PDF
      </button>
    </div>
  );
}

export default ImagesToPdf;