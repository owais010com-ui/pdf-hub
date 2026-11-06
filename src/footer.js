import { StandardFonts, rgb } from "pdf-lib";
import { config } from "./config";

const clean = (s) => s.replace(/[^\x20-\x7E]/g, "").trim();

export async function addFooter(doc) {
  const name = clean(config.footerName || "");
  if (!name) return;
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const size = 9;
  const color = rgb(0.4, 0.4, 0.4);

  doc.getPages().forEach((page) => {
    const { width } = page.getSize();
    const w = font.widthOfTextAtSize(name, size);
    page.drawText(name, { x: (width - w) / 2, y: 14, size, font, color });
  });
}
