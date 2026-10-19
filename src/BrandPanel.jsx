import { useState } from "react";

function BrandPanel({ brand, save, reset }) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        const p = new URLSearchParams();
        p.set("name", brand.name);
        p.set("tagline", brand.tagline);
        const url = `${window.location.origin}${window.location.pathname}?${p}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt("Copy this link:", url);
        }
    };

    return (
        <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>Branding</div>

            <div className="flex flex-col gap-4">
                <div>
                    <span className="label">Business name</span>
                    <input
                        className="input"
                        style={{ width: "100%" }}
                        value={brand.name}
                        onChange={(e) => save({ name: e.target.value })}
                    />
                </div>

                <div>
                    <span className="label">Description</span>
                    <input
                        className="input"
                        style={{ width: "100%" }}
                        value={brand.tagline}
                        onChange={(e) => save({ tagline: e.target.value })}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button className="btn" onClick={copyLink}>
                        {copied ? "Copied" : "Copy client link"}
                    </button>
                    <button className="btn btn-ghost" onClick={reset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BrandPanel;