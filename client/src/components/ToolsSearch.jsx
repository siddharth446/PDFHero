import React, { useEffect, useMemo, useRef, useState } from "react";
import { TOOLS } from "../data/toolsData";
import { useNavigate } from "react-router-dom";
import "../styles/tools-ui.css";

function normalize(s = "") {
  return s.toLowerCase().trim();
}

function score(tool, q) {
  if (!q) return 0;
  const hay = normalize(`${tool.title} ${tool.desc} ${(tool.tags || []).join(" ")}`);
  const title = normalize(tool.title);

  if (title === q) return 200;
  if (title.includes(q)) return 120;
  if (hay.includes(q)) return 80;

  const tokens = q.split(/\s+/).filter(Boolean);
  let hit = 0;
  for (const t of tokens) if (hay.includes(t)) hit += 12;
  return hit;
}

export default function ToolsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return TOOLS
      .map((t) => ({ t, s: score(t, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.t)
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    setActive(0);
    setOpen(results.length > 0);
  }, [query, results.length]);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Ctrl+K focus (safe)
  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function goTo(tool) {
    if (!tool) return;
    navigate(tool.href);
  }

  function onKeyDown(e) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      goTo(results[active]);
    }
  }

  return (
    <div className="ph-search" ref={boxRef}>
      <div className="ph-searchBar">
        <span className="ph-searchIcon" aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search a tool (merge, compress, pdf to word...)"
          aria-label="Search PDF tools"
          className="ph-searchInput"
        />
        <span className="ph-kbd" aria-hidden="true">Ctrl K</span>
      </div>

      {open && (
        <div className="ph-results" role="listbox" aria-label="Tool results">
          {results.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`ph-resultItem ${i === active ? "isActive" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => goTo(t)}
            >
              <div className="ph-resultTitle">{t.title}</div>
              <div className="ph-resultDesc">{t.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}