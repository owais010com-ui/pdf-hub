export function Choice({ value, onChange, options }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(([v, l]) => (
                <button
                    key={v}
                    type="button"
                    className={`btn btn-ghost btn-sm ${value === v ? "on" : ""}`}
                    onClick={() => onChange(v)}
                >
                    {l}
                </button>
            ))}
        </div>
    );
}

export function Field({ label, children }) {
    return (
        <div>
            <span className="label">{label}</span>
            {children}
        </div>
    );
}

export function Progress({ done, total }) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
        <div>
            <div
                style={{
                    height: 8,
                    borderRadius: 99,
                    background: "var(--line)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: pct + "%",
                        height: "100%",
                        background: "var(--ink)",
                        transition: "width 0.2s ease",
                    }}
                />
            </div>
            <p className="note" dir="ltr" style={{ margin: "6px 0 0", textAlign: "center" }}>
                {done} / {total}
            </p>
        </div>
    );
}