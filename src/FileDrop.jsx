import { useRef, useState } from "react";

function FileDrop({ types, multiple, onFiles, label }) {
    const ref = useRef();
    const [over, setOver] = useState(false);

    const take = (list) => {
        const files = Array.from(list).filter((f) => types.includes(f.type));
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
    };

    return (
        <div
            onClick={() => ref.current.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                take(e.dataTransfer.files);
            }}
            className={`cursor-pointer text-center rounded-2xl border-2 border-dashed p-8 transition ${over
                    ? "border-[var(--brand)] bg-white/10 scale-[1.02]"
                    : "border-white/20 hover:border-[var(--brand)] hover:bg-white/5"
                }`}
        >
            <div className="text-4xl mb-2">📂</div>
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-white/50">Drag and drop here, or click to choose</p>
            <input
                ref={ref}
                type="file"
                hidden
                multiple={multiple}
                accept={types.join(",")}
                onChange={(e) => {
                    take(e.target.files);
                    e.target.value = "";
                }}
            />
        </div>
    );
}

export default FileDrop;