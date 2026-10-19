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
            className={`drop ${over ? "over" : ""}`}
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
        >
            <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
            <p className="note" style={{ margin: "4px 0 0" }}>
                Drop here or click to choose
            </p>
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