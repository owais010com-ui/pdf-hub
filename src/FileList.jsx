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
    const move = (i, d) => {
        const next = [...files];
        const j = i + d;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        setFiles(next);
    };
    const remove = (i) => setFiles(files.filter((_, k) => k !== i));

    if (!files.length) return null;

    return (
        <div className="flex flex-col gap-2">
            {files.map((f, i) => (
                <div key={f.name + i} className="row">
                    <span className="note" style={{ width: 20, textAlign: "center" }}>
                        {i + 1}
                    </span>
                    <Thumb file={f} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 14,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {f.name}
                        </div>
                        <div className="note">{size(f.size)}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => move(i, -1)}>↑</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => move(i, 1)}>↓</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(i)}>✕</button>
                </div>
            ))}
        </div>
    );
}

export default FileList;