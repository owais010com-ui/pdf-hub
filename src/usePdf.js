import { useState } from "react";
import { PDFDocument } from "pdf-lib";

export function usePdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);

  const pick = async ([f]) => {
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setTotal(doc.getPageCount());
      setError(false);
    } catch {
      setFile(null);
      setTotal(0);
      setError(true);
    }
  };

  return { file, total, error, pick };
}
