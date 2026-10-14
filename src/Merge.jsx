import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";

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
    download(await merged.save(), "merged.pdf");
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleSelect}
      />
      <ul className="text-sm text-gray-600 list-disc pl-5">
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
      <button
        onClick={mergePDFs}
        disabled={files.length < 2}
        className="bg-[var(--brand)] text-white px-5 py-2 rounded disabled:opacity-40"
      >
        Merge PDFs
      </button>
    </div>
  );
}

export default Merge;
