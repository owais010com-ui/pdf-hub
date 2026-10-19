import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export function usePdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const pick = async ([f]) => {
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setTotal(doc.getPageCount());
      setError("");
    } catch {
      setFile(null);
      setTotal(0);
      setError(
        "Could not open this PDF. It may be password protected or damaged.",
      );
    }
  };

  return { file, total, error, pick };
}
