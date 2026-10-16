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
        <img src={url} alt="" className="w-12 h-12 object-cover rounded-lg" />
    ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center text-xs font-bold">
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
        <ul className="space-y-2">
            {files.map((f, i) => (
                <li
                    key={f.name + i}
                    className="fade-up flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2"
                >
                    <span className="w-6 text-center text-white/40 text-sm">{i + 1}</span>
                    <Thumb file={f} />
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{f.name}</p>
                        <p className="text-xs text-white/40">{size(f.size)}</p>
                    </div>
                    <button className="btn-ghost !px-3 !py-1" onClick={() => move(i, -1)}>
                        ↑
                    </button>
                    <button className="btn-ghost !px-3 !py-1" onClick={() => move(i, 1)}>
                        ↓
                    </button>
                    <button
                        className="btn-ghost !px-3 !py-1 !text-pink-400"
                        onClick={() => remove(i)}
                    >
                        ✕
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default FileList;