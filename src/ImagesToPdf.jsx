import { useState } from "react";
import { PDFDocument } from "pdf-lib";

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
    const data = await pdf.save();
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/pdf" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "images.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Images to PDF</h1>
      <input
        type="file"
        accept="image/png, image/jpeg"
        multiple
        onChange={handleSelect}
      />
      <ul>
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
      <button onClick={makePDF} disabled={files.length === 0}>
        PDF banao
      </button>
    </div>
  );
}

export default ImagesToPdf;
