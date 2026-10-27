import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import { renderThumbs } from "./pdfThumbs";
import { addFooter } from "./footer";
import { useT } from "./i18n";
import FileDrop from "./FileDrop";
import FileList from "./FileList";
import FooterToggle from "./FooterToggle";
import { Progress } from "./ui";

function Merge() {
  const { t } = useT();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);

  const update = (f) => {
    setFiles(f);
    setResult(null);
  };

  const mergePDFs = async () => {
    setBusy(true);
    setDone(0);
    setMsg("");
    setResult(null);
    let data;
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
        setDone((d) => d + 1);
      }
      await addFooter(merged);
      data = await merged.save();
    } catch {
      setMsg(t("pdfOpenMerge"));
      setBusy(false);
      return;
    }

    setResult({ data, thumbs: [] });
    try {
      await renderThumbs(data, (src) =>
        setResult((r) => (r ? { ...r, thumbs: [...r.thumbs, src] } : r))
      );
    } catch {
      setMsg(t("previewFailMerge"));
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["application/pdf"]}
        multiple
        label={t("addPdfs")}
        onFiles={(f) => update([...files, ...f])}
      />
      <FileList files={files} setFiles={update} />
      <p className="note">{t("mergeHint")}</p>
      <FooterToggle />
      {msg && <p className="error">{msg}</p>}

      {busy && <Progress done={done} total={files.length} />}
      <button className="btn" onClick={mergePDFs} disabled={files.length < 2 || busy}>
        {busy ? t("merging") : t("mergePreview")}
      </button>

      {result && (
        <div className="flex flex-col gap-3">
          <p className="note" style={{ margin: 0 }}>
            {t("previewLoaded", { n: result.thumbs.length })}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 8,
            }}
          >
            {result.thumbs.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6 }}
              />
            ))}
          </div>
          <button className="btn" onClick={() => download(result.data, "merged.pdf")}>
            {t("dlMerged")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Merge;