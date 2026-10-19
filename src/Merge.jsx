import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import FileDrop from "./FileDrop";
import FileList from "./FileList";

function Merge() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const mergePDFs = async () => {
    setBusy(true);
    setMsg("");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      download(await merged.save(), "merged.pdf");
    } catch {
      setMsg("One of the PDFs could not be opened (password protected or damaged).");
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["application/pdf"]}
        multiple
        label="Add PDF files"
        onFiles={(f) => setFiles([...files, ...f])}
      />
      <FileList files={files} setFiles={setFiles} />
      <p className="note">Use the arrows to set the order. Minimum 2 PDFs.</p>
      {msg && <p className="error">{msg}</p>}
      <button className="btn" onClick={mergePDFs} disabled={files.length < 2 || busy}>
        {busy ? "Merging..." : "Merge PDFs"}
      </button>
    </div>
  );
}

export default Merge;