import { useEffect, useRef, useState } from "react";
import { useT } from "./i18n";

const clean = (s) => s.replace(/[\\/:*?"<>|]/g, "").trim();

function SaveDialog() {
    const { t } = useT();
    const [req, setReq] = useState(null);
    const [name, setName] = useState("");
    const input = useRef();

    useEffect(() => {
        const onReq = (e) => {
            const { filename } = e.detail;
            const dot = filename.lastIndexOf(".");
            setName(dot > 0 ? filename.slice(0, dot) : filename);
            setReq({ ...e.detail, ext: dot > 0 ? filename.slice(dot) : "" });
        };
        window.addEventListener("save-request", onReq);
        return () => window.removeEventListener("save-request", onReq);
    }, []);

    useEffect(() => {
        if (req && input.current) {
            input.current.focus();
            input.current.select();
        }
    }, [req]);

    if (!req) return null;

    const cancel = () => setReq(null);

    const save = () => {
        const filename = (clean(name) || "document") + req.ext;
        const blob = new Blob([req.data], { type: req.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        const size =
            blob.size > 1024 * 1024
                ? (blob.size / 1024 / 1024).toFixed(1) + " MB"
                : Math.round(blob.size / 1024) + " KB";
        window.dispatchEvent(new CustomEvent("toast", { detail: { name: filename, size } }));

        if (req.onSaved) req.onSaved();
        setReq(null);
    };

    return (
        <div className="overlay" onClick={cancel}>
            <div className="card dialog swap" onClick={(e) => e.stopPropagation()}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>{t("saveTitle")}</div>
                <span className="label">{t("fileNameLabel")}</span>
                <div className="flex items-center gap-2" dir="ltr">
                    <input
                        ref={input}
                        className="input"
                        style={{ flex: 1, width: "100%" }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") save();
                            if (e.key === "Escape") cancel();
                        }}
                    />
                    <span className="note">{req.ext}</span>
                </div>
                <div className="flex gap-2" style={{ marginTop: 18, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost" onClick={cancel}>
                        {t("cancelBtn")}
                    </button>
                    <button className="btn" onClick={save}>
                        {t("saveBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SaveDialog;