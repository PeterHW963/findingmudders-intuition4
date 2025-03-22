import React from "react";
import "./ProjectCard.css";

export default function ProjectCard({ name, description }) {
  <div className="project-card">
    <h2 className="project-title">{name}</h2>
    <p className="project-description">{description}</p>
  </div>;
}
