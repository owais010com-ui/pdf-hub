import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import FileDrop from "./FileDrop";

function Split() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);

  const handleSelect = async ([f]) => {
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
    <div className="space-y-5">
      <FileDrop
        types={["application/pdf"]}
        label={file ? file.name : "Choose a PDF"}
        onFiles={handleSelect}
      />
      {file && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/60">Pages {total} total. Extract from</span>
          <input type="number" className="input" min="1" max={total} value={from}
            onChange={(e) => setFrom(Number(e.target.value))} />
          <span className="text-white/60">to</span>
          <input type="number" className="input" min="1" max={total} value={to}
            onChange={(e) => setTo(Number(e.target.value))} />
        </div>
      )}
      <button className="btn-primary w-full" onClick={split} disabled={!valid}>
        Extract pages
      </button>
    </div>
  );
}

export default Split;