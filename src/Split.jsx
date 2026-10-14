import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";

function Split() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);

  const handleSelect = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setFile(f);
    setTotal(pdf.getPageCount());
    setFrom(1);
    setTo(pdf.getPageCount());
  };

  const split = async () => {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const out = await PDFDocument.create();
    const indices = [];
    for (let i = from - 1; i <= to - 1; i++) indices.push(i);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    download(await out.save(), "split.pdf");
  };

  const valid = file && from >= 1 && to <= total && from <= to;

  return (
    <div className="space-y-4">
      <input type="file" accept="application/pdf" onChange={handleSelect} />
      {file && (
        <>
          <p className="text-sm text-gray-600">Total pages: {total}</p>
          <div className="flex gap-3 items-center">
            <span>From</span>
            <input
              type="number"
              min="1"
              max={total}
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              className="border rounded p-2 w-20"
            />
            <span>to</span>
            <input
              type="number"
              min="1"
              max={total}
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              className="border rounded p-2 w-20"
            />
          </div>
        </>
      )}
      <button
        onClick={split}
        disabled={!valid}
        className="bg-[var(--brand)] text-white px-5 py-2 rounded disabled:opacity-40"
      >
        Extract pages
      </button>
    </div>
  );
}

export default Split;
