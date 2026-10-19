import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import { parsePages } from "./utils";
import { usePdf } from "./usePdf";
import FileDrop from "./FileDrop";

function Split() {
  const { file, total, error, pick } = usePdf();
  const [range, setRange] = useState("");
  const [msg, setMsg] = useState("");

  const run = async () => {
    const idx = parsePages(range, total);
    if (!idx || !idx.length) return setMsg("Invalid pages. Example: 1-3, 7");
    setMsg("");
    const src = await PDFDocument.load(await file.arrayBuffer());
    const out = await PDFDocument.create();
    (await out.copyPages(src, idx)).forEach((p) => out.addPage(p));
    download(await out.save(), "split.pdf");
  };

  return (
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["application/pdf"]}
        label={file ? file.name : "Choose a PDF"}
        onFiles={pick}
      />
      {error && <p className="error">{error}</p>}
      {file && (
        <div>
          <span className="label">Pages to extract (total {total})</span>
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="Example: 1-3, 7"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
        </div>
      )}
      {msg && <p className="error">{msg}</p>}
      <button className="btn" onClick={run} disabled={!file}>
        Extract pages
      </button>
    </div>
  );
}

export default Split;