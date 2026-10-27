import { StandardFonts, rgb } from "pdf-lib";
import { config } from "./config";

const KEY = "footer";

export function getFooter() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setFooter(on) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

const clean = (s) => s.replace(/[^\x20-\x7E]/g, "").trim();

export async function addFooter(doc) {
  const name = clean(config.footerName || "");
  const showNumber = getFooter();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const size = 9;
  const y = 14;
  const color = rgb(0.4, 0.4, 0.4);

  pages.forEach((page, i) => {
    const { width } = page.getSize();
    if (name) {
      const w = font.widthOfTextAtSize(name, size);
      page.drawText(name, { x: (width - w) / 2, y, size, font, color });
    }
    if (showNumber) {
      const label = `${i + 1} / ${total}`;
      const lw = font.widthOfTextAtSize(label, size);
      page.drawText(label, { x: width - 24 - lw, y, size, font, color });
    }
  });
}
