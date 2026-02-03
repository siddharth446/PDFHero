import React from "react";
import { TOOLS } from "../data/toolsData";
import { useNavigate } from "react-router-dom";
import "../styles/tools-ui.css";

export default function ToolsGrid() {
  const navigate = useNavigate();

  function go(href) {
    navigate(href);
  }

  return (
    <div className="ph-grid" aria-label="Tools grid">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className="ph-card"
          onClick={() => go(t.href)}
        >
          <div className="ph-pill">Tool</div>
          <h3 className="ph-cardTitle">{t.title}</h3>
          <p className="ph-cardDesc">{t.desc}</p>
          <span className="ph-cardLink">Open tool →</span>
        </button>
      ))}
    </div>
  );
}