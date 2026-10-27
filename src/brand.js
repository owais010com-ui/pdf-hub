import { useState } from "react";
import { config } from "./config";

const KEY = "brand";

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function read() {
  const p = new URLSearchParams(window.location.search);
  const saved = readSaved();
  return {
    name: p.get("name") ?? saved.name ?? config.name,
    tagline: p.get("tagline") ?? saved.tagline ?? config.tagline,
  };
}

export function useBrand() {
  const [brand, setBrand] = useState(read);

  const save = (patch) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...readSaved(), ...patch }));
    } catch {
      /* ignore */
    }
    setBrand(read());
  };

  const reset = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setBrand(read());
  };

  return { brand, save, reset };
}

export { read as getBrand };
