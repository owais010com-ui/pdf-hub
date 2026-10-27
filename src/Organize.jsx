import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { download } from "./download";
import { renderThumbs } from "./pdfThumbs";
import { addFooter } from "./footer";
import { useT } from "./i18n";
import FileDrop from "./FileDrop";
import FooterToggle from "./FooterToggle";

function Organize() {
    const { t } = useT();
    const [file, setFile] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const [warn, setWarn] = useState(false);
    const [drag, setDrag] = useState(null);
    const bytes = useRef(null);

    const pick = async ([f]) => {
        setErr(false);
        setWarn(false);
        setItems([]);
        setFile(null);
        setLoading(true);

        let count;
        try {
            bytes.current = await f.arrayBuffer();
            const doc = await PDFDocument.load(bytes.current);
            count = doc.getPageCount();
        } catch {
            setErr(true);
            setLoading(false);
            return;
        }

        setFile(f);
        setItems(Array.from({ length: count }, (_, i) => ({ id: i, index: i, src: "" })));

        try {
            await renderThumbs(bytes.current, (src, i) =>
                setItems((prev) => prev.map((x) => (x.index === i ? { ...x, src } : x)))
            );
        } catch {
            setWarn(true);
        }
        setLoading(false);
    };

    const move = (from, to) => {
        if (from === null || from === to || to < 0 || to >= items.length) return;
        const next = [...items];
        const [m] = next.splice(from, 1);
        next.splice(to, 0, m);
        setItems(next);
    };

    const remove = (i) => setItems(items.filter((_, k) => k !== i));

    const save = async () => {
        const src = await PDFDocument.load(bytes.current);
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, items.map((x) => x.index));
        pages.forEach((p) => out.addPage(p));
        await addFooter(out);
        download(await out.save(), "organized.pdf");
    };

    const small = { padding: "4px 9px" };

    return (
        <div className="flex flex-col gap-5">
            <FileDrop
                types={["application/pdf"]}
                label={file ? file.name : t("choosePdf")}
                onFiles={pick}
            />
            {err && <p className="error">{t("pdfOpen")}</p>}
            {warn && <p className="note">{t("prevFail")}</p>}

            {file && (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="note">
                            {loading ? t("loadingPrev") : t("nPages", { n: items.length })} · {t("dragHint")}
                        </span>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setItems([...items].reverse())}
                            disabled={items.length < 2}
                        >
                            {t("reverse")}
                        </button>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: 10,
                        }}
                    >
                        {items.map((it, i) => (
                            <div
                                key={it.id}
                                draggable
                                onDragStart={() => setDrag(i)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    move(drag, i);
                                    setDrag(null);
                                }}
                                onDragEnd={() => setDrag(null)}
                                style={{
                                    border: "1px solid var(--line)",
                                    borderRadius: 10,
                                    padding: 6,
                                    background: "var(--input)",
                                    opacity: drag === i ? 0.4 : 1,
                                    cursor: "grab",
                                }}
                            >
                                {it.src ? (
                                    <img
                                        src={it.src}
                                        alt=""
                                        draggable={false}
                                        style={{ width: "100%", display: "block", borderRadius: 6 }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            aspectRatio: "1 / 1.35",
                                            display: "grid",
                                            placeItems: "center",
                                            background: "var(--line)",
                                            borderRadius: 6,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {t("pageN", { n: it.index + 1 })}
                                    </div>
                                )}
                                <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                                    <span className="note">{i + 1}</span>
                                    <span className="flex gap-1" dir="ltr">
                                        <button className="btn btn-ghost" style={small} onClick={() => move(i, i - 1)} disabled={i === 0}>
                                            ‹
                                        </button>
                                        <button className="btn btn-ghost" style={small} onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
                                            ›
                                        </button>
                                        <button className="btn btn-ghost" style={small} onClick={() => remove(i)}>
                                            ✕
                                        </button>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <FooterToggle />
            <button className="btn" onClick={save} disabled={!items.length || loading}>
                {t("savePdf")}
            </button>
        </div>
    );
}

export default Organize;