import { useRef, useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { download } from "./download";
import { parsePages } from "./utils";
import { renderPage } from "./pdfThumbs";
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

const MARGIN = 28;

function Stamp() {
    const { t } = useT();
    const { file, total, error, pick, reset } = usePdf();
    const bytes = useRef(null);
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
    const [idx, setIdx] = useState(0);
    const [prev, setPrev] = useState(null);
    const [loadingPrev, setLoadingPrev] = useState(false);

    const showPage = async (i) => {
        setLoadingPrev(true);
        try {
            setPrev(await renderPage(bytes.current, i, 700));
            setIdx(i);
        } catch {
            setPrev(null);
        }
        setLoadingPrev(false);
    };

    const onPick = async ([f]) => {
        bytes.current = await f.arrayBuffer();
        await pick([f]);
        setIdx(0);
        showPage(0);
    };

    const switchMode = (m) => {
        setMode(m);
        setSize(DEFAULTS[m].size);
        setColor(DEFAULTS[m].color);
        setMsg("");
    };

    const place = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setX(Math.min(95, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
        setY(Math.min(95, Math.max(0, ((e.clientY - r.top) / r.height) * 100)));
    };

    const run = async () => {
        const idxs = parsePages(pages, total);
        if (!idxs || !idxs.length) return setMsg(t("badPagesAll"));
        if (mode !== "numbers" && !text.trim()) return setMsg(t("typeFirst"));
        setBusy(true);
        setMsg("");
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const font = await doc.embedFont(StandardFonts.Helvetica);
            const all = doc.getPages();

            idxs.forEach((i) => {
                const page = all[i];
                const { width: pw, height: ph } = page.getSize();

                if (mode === "text") {
                    page.drawText(text, {
                        x: (pw * x) / 100,
                        y: ph - (ph * y) / 100 - size * 0.8,
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
                    const px = pos.endsWith("l")
                        ? MARGIN
                        : pos.endsWith("r")
                            ? pw - MARGIN - w
                            : (pw - w) / 2;
                    const py = pos.startsWith("t") ? ph - MARGIN - size * 0.8 : MARGIN + size * 0.2;
                    page.drawText(label, { x: px, y: py, size, font, color: toRgb(color) });
                }
            });

            download(await doc.save(), "edited.pdf", "application/pdf", () => {
                reset();
                bytes.current = null;
                setPrev(null);
                setIdx(0);
                setText("");
                setPages("all");
                setMsg("");
            });
        } catch {
            setMsg(t("stampErr"));
        }
        setBusy(false);
    };

    const fontCqw = prev ? `${(size / prev.ptWidth) * 100}cqw` : "12px";
    const marginCqw = prev ? `${(MARGIN / prev.ptWidth) * 100}cqw` : "0";
    const sample = text || "Your text";
    const numLabel = fmt === "n" ? String(idx + 1) : `Page ${idx + 1} of ${total}`;

    const overlayBase = {
        position: "absolute",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: fontCqw,
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
    };

    let overlay = null;
    if (prev) {
        if (mode === "text") {
            overlay = (
                <div dir="ltr" style={{ ...overlayBase, left: `${x}%`, top: `${y}%` }}>
                    {sample}
                </div>
            );
        } else if (mode === "watermark") {
            overlay = (
                <div
                    dir="ltr"
                    style={{
                        ...overlayBase,
                        left: "50%",
                        top: "50%",
                        opacity,
                        transform: "translate(-50%, -50%) rotate(-45deg)",
                    }}
                >
                    {sample}
                </div>
            );
        } else {
            overlay = (
                <div
                    dir="ltr"
                    style={{
                        ...overlayBase,
                        ...(pos.startsWith("t") ? { top: marginCqw } : { bottom: marginCqw }),
                        ...(pos.endsWith("l")
                            ? { left: marginCqw }
                            : pos.endsWith("r")
                                ? { right: marginCqw }
                                : { left: "50%", transform: "translateX(-50%)" }),
                    }}
                >
                    {numLabel}
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <FileDrop
                types={["application/pdf"]}
                label={file ? file.name : t("choosePdf")}
                onFiles={onPick}
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

                    {mode === "text" && <p className="note">{t("placeHint")}</p>}

                    <div className="flex items-center justify-between gap-2" dir="ltr">
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => showPage(idx - 1)}
                            disabled={idx === 0 || loadingPrev}
                        >
                            ‹
                        </button>
                        <span className="note">{t("pageOfN", { a: idx + 1, b: total })}</span>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => showPage(idx + 1)}
                            disabled={idx + 1 >= total || loadingPrev}
                        >
                            ›
                        </button>
                    </div>

                    {prev ? (
                        <div
                            onPointerDown={(e) => {
                                if (mode !== "text") return;
                                e.currentTarget.setPointerCapture(e.pointerId);
                                place(e);
                            }}
                            onPointerMove={(e) => {
                                if (mode === "text" && e.buttons) place(e);
                            }}
                            style={{
                                position: "relative",
                                containerType: "inline-size",
                                touchAction: mode === "text" ? "none" : "auto",
                                cursor: mode === "text" ? "crosshair" : "default",
                                border: "1px solid var(--line)",
                                borderRadius: 8,
                                overflow: "hidden",
                                lineHeight: 0,
                                userSelect: "none",
                            }}
                        >
                            <img
                                src={prev.src}
                                alt=""
                                draggable={false}
                                style={{ width: "100%", display: "block" }}
                            />
                            {overlay}
                        </div>
                    ) : (
                        <p className="note">{loadingPrev ? t("previewLoading") : t("previewFail")}</p>
                    )}

                    {mode === "watermark" && (
                        <div>
                            <span className="label">{t("opacity", { n: Math.round(opacity * 100) })}</span>
                            <input
                                type="range"
                                dir="ltr"
                                min="0.05"
                                max="1"
                                step="0.05"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                style={{ width: "100%" }}
                            />
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
                            <input
                                type="number"
                                className="input"
                                style={{ width: 90 }}
                                min="6"
                                max="200"
                                value={size}
                                onChange={(e) => setSize(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <span className="label">{t("color")}</span>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: 60, height: 42 }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <span className="label">{t("pagesTotal", { n: total })}</span>
                            <input
                                className="input"
                                dir="ltr"
                                style={{ width: "100%" }}
                                value={pages}
                                onChange={(e) => setPages(e.target.value)}
                            />
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