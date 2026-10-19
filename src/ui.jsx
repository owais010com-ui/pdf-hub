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