import React from "react";
import "./ProjectCard.css";

export default function ProjectCard({ title }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        margin: "8px auto",
        maxWidth: "600px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ margin: 0, fontFamily: "Roboto, Arial, sans-serif" }}>
        {title}
      </h2>
    </div>
  );
}
