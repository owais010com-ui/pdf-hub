import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import { parsePages } from "./utils";
import { addFooter } from "./footer";
import { usePdf } from "./usePdf";
import { useT } from "./i18n";
import FileDrop from "./FileDrop";
import FooterToggle from "./FooterToggle";

function Split() {
  const { t } = useT();
  const { file, total, error, pick } = usePdf();
  const [range, setRange] = useState("");
  const [msg, setMsg] = useState("");

  const run = async () => {
    const idx = parsePages(range, total);
    if (!idx || !idx.length) return setMsg(t("badPages"));
    setMsg("");
    const src = await PDFDocument.load(await file.arrayBuffer());
    const out = await PDFDocument.create();
    (await out.copyPages(src, idx)).forEach((p) => out.addPage(p));
    await addFooter(out);
    download(await out.save(), "split.pdf");
  };

  return (
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["application/pdf"]}
        label={file ? file.name : t("choosePdf")}
        onFiles={pick}
      />
      {error && <p className="error">{t("pdfOpen")}</p>}
      {file && (
        <div>
          <span className="label">{t("pagesToExtract", { n: total })}</span>
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder={t("splitPh")}
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
        </div>
      )}
      <FooterToggle />
      {msg && <p className="error">{msg}</p>}
      <button className="btn" onClick={run} disabled={!file}>
        {t("extract")}
      </button>
    </div>
  );
}

export default Split;