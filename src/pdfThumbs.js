import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

function drawToCanvas(page, width) {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, viewport, base };
}

export async function renderThumbs(bytes, onThumb, width = 200) {
  const data = new Uint8Array(bytes.slice(0));
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;

  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const { canvas, ctx, viewport } = drawToCanvas(page, width);
      await page.render({ canvasContext: ctx, canvas, viewport }).promise;
      onThumb(canvas.toDataURL("image/jpeg", 0.75), i - 1);
      page.cleanup();
    }
  } finally {
    try {
      await task.destroy();
    } catch {
      /* ignore */
    }
  }
}

export async function renderPage(bytes, index, width = 700) {
  const data = new Uint8Array(bytes.slice(0));
  const task = pdfjs.getDocument({ data });
  const doc = await task.promise;

  try {
    const page = await doc.getPage(index + 1);
    const { canvas, ctx, viewport, base } = drawToCanvas(page, width);
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    return {
      src: canvas.toDataURL("image/jpeg", 0.85),
      ptWidth: base.width,
      ptHeight: base.height,
    };
  } finally {
    try {
      await task.destroy();
    } catch {
      /* ignore */
    }
  }
}
