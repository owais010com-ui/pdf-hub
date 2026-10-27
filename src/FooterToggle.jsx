import { useState } from "react";
import { getFooter, setFooter } from "./footer";
import { useT } from "./i18n";

function FooterToggle() {
    const { t } = useT();
    const [on, setOn] = useState(getFooter);

    return (
        <label className="flex items-center gap-2" style={{ cursor: "pointer", fontSize: 14 }}>
            <input
                type="checkbox"
                checked={on}
                onChange={(e) => {
                    setOn(e.target.checked);
                    setFooter(e.target.checked);
                }}
            />
            {t("footerOpt")}
        </label>
    );
}

export default FooterToggle;