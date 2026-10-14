export function download(data, filename) {
  const url = URL.createObjectURL(
    new Blob([data], { type: "application/pdf" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
