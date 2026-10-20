// import { useState } from "react";
// import { PDFDocument } from "pdf-lib";
// import { download } from "./download";
// import { parsePages } from "./utils";
// import { usePdf } from "./usePdf";
// import FileDrop from "./FileDrop";
// import { Choice, Field } from "./ui";

// function Pages() {
//     const { file, total, error, pick } = usePdf();
//     const [op, setOp] = useState("delete");
//     const [range, setRange] = useState("");
//     const [msg, setMsg] = useState("");

//     const run = async () => {
//         const doc = await PDFDocument.load(await file.arrayBuffer());

//         if (op === "delete") {
//             const idx = parsePages(range, total);
//             if (!idx || !idx.length) return setMsg("Invalid pages. Example: 1-3, 7");
//             if (idx.length === total) return setMsg("You cannot delete all pages.");
//             setMsg("");
//             [...idx].reverse().forEach((i) => doc.removePage(i));
//             download(await doc.save(), "edited.pdf");
//         } else {
//             setMsg("");
//             const out = await PDFDocument.create();
//             const order = Array.from({ length: total }, (_, i) => total - 1 - i);
//             (await out.copyPages(doc, order)).forEach((p) => out.addPage(p));
//             download(await out.save(), "reversed.pdf");
//         }
//     };

//     return (
//         <div className="flex flex-col gap-5">
//             <FileDrop
//                 types={["application/pdf"]}
//                 label={file ? file.name : "Choose a PDF"}
//                 onFiles={pick}
//             />
//             {error && <p className="error">{error}</p>}
//             {file && (
//                 <>
//                     <Field label="What do you want to do?">
//                         <Choice
//                             value={op}
//                             onChange={(v) => {
//                                 setOp(v);
//                                 setMsg("");
//                             }}
//                             options={[["delete", "Delete pages"], ["reverse", "Reverse order"]]}
//                         />
//                     </Field>
//                     {op === "delete" && (
//                         <div>
//                             <span className="label">Pages to delete (total {total}). Example: 1-3, 7</span>
//                             <input
//                                 className="input"
//                                 style={{ width: "100%" }}
//                                 value={range}
//                                 onChange={(e) => setRange(e.target.value)}
//                             />
//                         </div>
//                     )}
//                 </>
//             )}
//             {msg && <p className="error">{msg}</p>}
//             <button className="btn" onClick={run} disabled={!file}>
//                 Apply and download
//             </button>
//         </div>
//     );
// }

// export default Pages;