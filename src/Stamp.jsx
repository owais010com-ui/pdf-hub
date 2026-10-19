import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { download } from "./download";
import { parsePages } from "./utils";
import { usePdf } from "./usePdf";
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
        if (!idx || !idx.length) return setMsg("Invalid pages. Example: all or 1-3, 7");
        if (mode !== "numbers" && !text.trim()) return setMsg("Type some text first.");
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
            setMsg("Could not add this text. Use English letters and numbers only.");
        }
        setBusy(false);
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
                <>
                    <Field label="Tool">
                        <Choice
                            value={mode}
                            onChange={switchMode}
                            options={[["text", "Add text"], ["watermark", "Watermark"], ["numbers", "Page numbers"]]}
                        />
                    </Field>

                    {mode !== "numbers" && (
                        <div>
                            <span className="label">Text (English only)</span>
                            <input
                                className="input"
                                style={{ width: "100%" }}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={mode === "watermark" ? "CONFIDENTIAL" : "Type here"}
                            />
                        </div>
                    )}

                    {mode === "text" && (
                        <>
                            <p className="note">
                                Adds new text on top of the PDF. Existing text in the PDF cannot be edited.
                            </p>
                            <div className="flex flex-wrap gap-5">
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <span className="label">Left to right: {x}%</span>
                                    <input type="range" min="0" max="95" value={x} onChange={(e) => setX(Number(e.target.value))} style={{ width: "100%" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 180 }}>
                                    <span className="label">Top to bottom: {y}%</span>
                                    <input type="range" min="0" max="95" value={y} onChange={(e) => setY(Number(e.target.value))} style={{ width: "100%" }} />
                                </div>
                            </div>
                        </>
                    )}

                    {mode === "watermark" && (
                        <div>
                            <span className="label">Opacity: {Math.round(opacity * 100)}%</span>
                            <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: "100%" }} />
                        </div>
                    )}

                    {mode === "numbers" && (
                        <>
                            <Field label="Position">
                                <Choice
                                    value={pos}
                                    onChange={setPos}
                                    options={[["bl", "Bottom left"], ["bc", "Bottom center"], ["br", "Bottom right"], ["tl", "Top left"], ["tc", "Top center"], ["tr", "Top right"]]}
                                />
                            </Field>
                            <Field label="Format">
                                <Choice value={fmt} onChange={setFmt} options={[["n", "1, 2, 3"], ["of", "Page 1 of N"]]} />
                            </Field>
                        </>
                    )}

                    <div className="flex flex-wrap gap-5 items-end">
                        <div>
                            <span className="label">Size</span>
                            <input type="number" className="input" style={{ width: 90 }} min="6" max="200" value={size} onChange={(e) => setSize(Number(e.target.value))} />
                        </div>
                        <div>
                            <span className="label">Color</span>
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 60, height: 42 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <span className="label">Pages (total {total})</span>
                            <input className="input" style={{ width: "100%" }} value={pages} onChange={(e) => setPages(e.target.value)} />
                        </div>
                    </div>
                </>
            )}

            {msg && <p className="error">{msg}</p>}
            <button className="btn" onClick={run} disabled={!file || busy}>
                {busy ? "Working..." : "Apply and download"}
            </button>
        </div>
    );
}

export default Stamp;