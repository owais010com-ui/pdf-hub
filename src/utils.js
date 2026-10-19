export function parsePages(str, total) {
  const s = str.trim().toLowerCase();
  if (!s || s === "all") return Array.from({ length: total }, (_, i) => i);
  const set = new Set();
  for (const part of s.split(",")) {
    const [a, b] = part.split("-").map((x) => parseInt(x.trim(), 10));
    if (Number.isNaN(a)) return null;
    const end = b === undefined || Number.isNaN(b) ? a : b;
    for (let i = Math.min(a, end); i <= Math.max(a, end); i++) {
      if (i < 1 || i > total) return null;
      set.add(i - 1);
    }
  }
  return [...set].sort((x, y) => x - y);
}

export async function imageToJpeg(file, maxSide = 2600) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * s);
  const height = Math.round(bmp.height * s);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise((res) =>
    canvas.toBlob(res, "image/jpeg", 0.92),
  );
  return { bytes: await blob.arrayBuffer(), width, height };
}
