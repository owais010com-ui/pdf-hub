export function download(data, filename, type = "application/pdf") {
  const blob = new Blob([data], { type });
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
  window.dispatchEvent(
    new CustomEvent("toast", { detail: { name: filename, size } }),
  );
}
