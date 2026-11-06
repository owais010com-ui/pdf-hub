export function download(data, filename, type = "application/pdf", onSaved) {
  window.dispatchEvent(
    new CustomEvent("save-request", {
      detail: { data, filename, type, onSaved },
    })
  );
}