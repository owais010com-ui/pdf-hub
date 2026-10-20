import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import { imageToJpeg } from "./utils";
import { useT } from "./i18n";
import FileDrop from "./FileDrop";
import FileList from "./FileList";
import { Choice, Field, Progress } from "./ui";

const PW = 595.28;
const PH = 841.89;
const M = 18;
const GAP = 12;

function ImagesToPdf() {
  const { t } = useT();
  const [files, setFiles] = useState([]);
  const [per, setPer] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [msg, setMsg] = useState("");
  const cam = useRef();

  const addFromCamera = (e) => {
    const f = Array.from(e.target.files).filter((x) =>
      ["image/jpeg", "image/png"].includes(x.type)
    );
    if (f.length) setFiles([...files, ...f]);
    e.target.value = "";
  };

  const makePDF = async () => {
    setBusy(true);
    setDone(0);
    setMsg("");
    try {
      const pdf = await PDFDocument.create();
      const imgs = [];
      for (const f of files) {
        const { bytes } = await imageToJpeg(f);
        imgs.push(await pdf.embedJpg(bytes));
        setDone((d) => d + 1);
      }

      const cols = per === 4 ? 2 : 1;
      const rows = per / cols;
      const cw = (PW - 2 * M - GAP * (cols - 1)) / cols;
      const ch = (PH - 2 * M - GAP * (rows - 1)) / rows;

      for (let i = 0; i < imgs.length; i += per) {
        const page = pdf.addPage([PW, PH]);
        imgs.slice(i, i + per).forEach((img, k) => {
          const col = k % cols;
          const row = Math.floor(k / cols);
          const s = Math.min(cw / img.width, ch / img.height);
          const w = img.width * s;
          const h = img.height * s;
          const cx = M + col * (cw + GAP);
          const cyTop = PH - M - row * (ch + GAP);
          page.drawImage(img, {
            x: cx + (cw - w) / 2,
            y: cyTop - ch + (ch - h) / 2,
            width: w,
            height: h,
          });
        });
      }
      download(await pdf.save(), "images.pdf");
    } catch {
      setMsg(t("imgErr"));
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <FileDrop
        types={["image/png", "image/jpeg"]}
        multiple
        label={t("addPhotos")}
        onFiles={(f) => setFiles([...files, ...f])}
      />

      <div>
        <button className="btn btn-ghost" onClick={() => cam.current.click()}>
          {t("scan")}
        </button>
        <input
          ref={cam}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={addFromCamera}
        />
        <p className="note" style={{ margin: "6px 0 0" }}>
          {t("scanHint")}
        </p>
      </div>

      <FileList files={files} setFiles={setFiles} />

      <Field label={t("perPage")}>
        <Choice value={per} onChange={setPer} options={[[1, "1"], [2, "2"], [4, "4"]]} />
      </Field>

      {msg && <p className="error">{msg}</p>}
      {busy && <Progress done={done} total={files.length} />}
      <button className="btn" onClick={makePDF} disabled={!files.length || busy}>
        {busy ? t("creating") : t("createPdf", { n: files.length })}
      </button>
    </div>
  );
}

export default ImagesToPdf;