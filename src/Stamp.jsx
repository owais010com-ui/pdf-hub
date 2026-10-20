import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { download } from "./download";
import { parsePages } from "./utils";
import { usePdf } from "./usePdf";
import { useT } from "./i18n";
import FileDrop from "./FileDrop";
import { Choice, Field } from "./ui";

const toRgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const DEFAULTS = {
    text: { size: 24, color: "#000000" },
    watermark: { size: 60, color: "#808080" },
    numbers: { size: 12, color: "#000000" },
};

function Stamp() {
    const { t } = useT();
    const { file, total, error, pick } = usePdf();
    const [mode, setMode] = useState("text");
    const [text, setText] = useState("");
    const [size, setSize] = useState(24);
    const [color, setColor] = useState("#000000");
    const [x, setX] = useState(10);
    const [y, setY] = useState(10);
    const [pages, setPages] = useState("all");
    const [opacity, setOpacity] = useState(0.25);
    const [pos, setPos] = useState("bc");
    const [fmt, setFmt] = useState("n");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const switchMode = (m) => {
        setMode(m);
        setSize(DEFAULTS[m].size);
        setColor(DEFAULTS[m].color);
        setMsg("");
    };

    const run = async () => {
        const idx = parsePages(pages, total);
        if (!idx || !idx.length) return setMsg(t("badPagesAll"));
        if (mode !== "numbers" && !text.trim()) return setMsg(t("typeFirst"));
        setBusy(true);
        setMsg("");
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const font = await doc.embedFont(StandardFonts.Helvetica);
            const all = doc.getPages();

            idx.forEach((i) => {
                const page = all[i];
                const { width: pw, height: ph } = page.getSize();

                if (mode === "text") {
                    page.drawText(text, {
                        x: (pw * x) / 100,
                        y: ph - (ph * y) / 100 - size,
                        size,
                        font,
                        color: toRgb(color),
                    });
                } else if (mode === "watermark") {
                    const w = font.widthOfTextAtSize(text, size);
                    const a = Math.PI / 4;
                    page.drawText(text, {
                        x: pw / 2 - (w / 2) * Math.cos(a) + (size / 3) * Math.sin(a),
                        y: ph / 2 - (w / 2) * Math.sin(a) - (size / 3) * Math.cos(a),
                        size,
                        font,
                        color: toRgb(color),
                        opacity,
                        rotate: degrees(45),
                    });
                } else {
                    const label = fmt === "n" ? String(i + 1) : `Page ${i + 1} of ${total}`;
                    const w = font.widthOfTextAtSize(label, size);
                    const m = 28;
                    const px = pos.endsWith("l") ? m : pos.endsWith("r") ? pw - m - w : (pw - w) / 2;
                    const py = pos.startsWith("t") ? ph - m - size : m;
                    page.drawText(label, { x: px, y: py, size, font, color: toRgb(color) });
                }
            });

            download(await doc.save(), "edited.pdf");
        } catch {
            setMsg(t("stampErr"));
        }
        setBusy(false);
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
                <>
                    <Field label={t("tool")}>
                        <Choice
                            value={mode}
                            onChange={switchMode}
                            options={[["text", t("addText")], ["watermark", t("watermark")], ["numbers", t("pageNumbers")]]}
                        />
                    </Field>

                    {mode !== "numbers" && (
                        <div>
                            <span className="label">{t("textEn")}</span>
                            <input
                                className="input"
                                dir="ltr"
                                style={{ width: "100%" }}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={mode === "watermark" ? "CONFIDENTIAL" : t("typeHere")}
                            />
                        </div>
                    )}

                    {mode === "text" && (
                        <>
                            <p className="note">{t("stampNote")}</p>
                            <div className="flex flex-wrap gap-5">
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <span className="label">{t("leftRight", { n: x })}</span>
                                    <input type="range" dir="ltr" min="0" max="95" value={x} onChange={(e) => setX(Number(e.target.value))} style={{ width: "100%" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <span className="label">{t("topBottom", { n: y })}</span>
                                    <input type="range" dir="ltr" min="0" max="95" value={y} onChange={(e) => setY(Number(e.target.value))} style={{ width: "100%" }} />
                                </div>
                            </div>
                        </>
                    )}

                    {mode === "watermark" && (
                        <div>
                            <span className="label">{t("opacity", { n: Math.round(opacity * 100) })}</span>
                            <input type="range" dir="ltr" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: "100%" }} />
                        </div>
                    )}

                    {mode === "numbers" && (
                        <>
                            <Field label={t("position")}>
                                <Choice
                                    value={pos}
                                    onChange={setPos}
                                    options={[["bl", t("bl")], ["bc", t("bc")], ["br", t("br")], ["tl", t("tl")], ["tc", t("tc")], ["tr", t("tr")]]}
                                />
                            </Field>
                            <Field label={t("format")}>
                                <Choice value={fmt} onChange={setFmt} options={[["n", "1, 2, 3"], ["of", t("fmtOf")]]} />
                            </Field>
                        </>
                    )}

                    <div className="flex flex-wrap gap-5 items-end">
                        <div>
                            <span className="label">{t("size")}</span>
                            <input type="number" className="input" style={{ width: 90 }} min="6" max="200" value={size} onChange={(e) => setSize(Number(e.target.value))} />
                        </div>
                        <div>
                            <span className="label">{t("color")}</span>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 60, height: 42 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <span className="label">{t("pagesTotal", { n: total })}</span>
                            <input className="input" dir="ltr" style={{ width: "100%" }} value={pages} onChange={(e) => setPages(e.target.value)} />
                        </div>
                    </div>
                </>
            )}

            {msg && <p className="error">{msg}</p>}
            <button className="btn" onClick={run} disabled={!file || busy}>
                {busy ? t("working") : t("apply")}
            </button>
        </div>
    );
}

export default Stamp;