import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function Merge() {
  const [files, setFiles] = useState([]);

  const handleSelect = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const mergePDFs = async () => {
    const merged = await PDFDocument.create();
    for (const file of files) {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const data = await merged.save();
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/pdf" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Merge PDF</h1>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleSelect}
      />
      <ul>
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
      <button onClick={mergePDFs} disabled={files.length < 2}>
        Merge karo
      </button>
    </div>
  );
}

export default Merge;
