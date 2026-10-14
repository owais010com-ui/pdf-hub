import { useState } from "react";
import ImagesToPdf from "./ImagesToPdf";
import Merge from "./Merge";
import "./App.css";

function App() {
  const [tab, setTab] = useState("images");

  return (
    <div className="container">
      <div className="tabs">
        <button
          className={tab === "images" ? "active" : ""}
          onClick={() => setTab("images")}
        >
          Images to PDF
        </button>
        <button
          className={tab === "merge" ? "active" : ""}
          onClick={() => setTab("merge")}
        >
          Merge PDF
        </button>
      </div>

      {tab === "images" ? <ImagesToPdf /> : <Merge />}
    </div>
  );
}

export default App;
