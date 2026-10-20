import { useEffect, useState } from "react";

const size = (b) =>
    b > 1024 * 1024
        ? (b / 1024 / 1024).toFixed(1) + " MB"
        : (b / 1024).toFixed(0) + " KB";

function Thumb({ file }) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (!file.type.startsWith("image/")) return;
        const u = URL.createObjectURL(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);

    return url ? (
        <img
            src={url}
            alt=""
            draggable={false}
            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }}
        />
    ) : (
        <div
            style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: "var(--line)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 700,
            }}
        >
            PDF
        </div>
    );
}

function FileList({ files, setFiles }) {
    const [drag, setDrag] = useState(null);
    const [over, setOver] = useState(null);

    const move = (from, to) => {
        if (from === null || from === to || to < 0 || to >= files.length) return;
        const next = [...files];
        const [m] = next.splice(from, 1);
        next.splice(to, 0, m);
        setFiles(next);
    };
    const remove = (i) => setFiles(files.filter((_, k) => k !== i));

    if (!files.length) return null;

    return (
        <div className="flex flex-col gap-2">
            {files.map((f, i) => (
                <div
                    key={f.name + f.size + i}
                    className="row"
                    draggable
                    onDragStart={() => setDrag(i)}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setOver(i);
                    }}
                    onDrop={() => {
                        move(drag, i);
                        setDrag(null);
                        setOver(null);
                    }}
                    onDragEnd={() => {
                        setDrag(null);
                        setOver(null);
                    }}
                    style={{
                        cursor: "grab",
                        opacity: drag === i ? 0.4 : 1,
                        borderColor: over === i && drag !== null && drag !== i ? "var(--ink)" : undefined,
                    }}
                >
                    <span className="note" style={{ width: 20, textAlign: "center" }}>
                        {i + 1}
                    </span>
                    <Thumb file={f} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            dir="ltr"
                            style={{
                                fontSize: 14,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: "start",
                            }}
                        >
                            {f.name}
                        </div>
                        <div className="note">{size(f.size)}</div>
                    </div>
                    <span className="flex gap-1" dir="ltr">
                        <button className="btn btn-ghost btn-sm" onClick={() => move(i, i - 1)} disabled={i === 0}>
                            ↑
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => move(i, i + 1)} disabled={i === files.length - 1}>
                            ↓
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => remove(i)}>
                            ✕
                        </button>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default FileList;