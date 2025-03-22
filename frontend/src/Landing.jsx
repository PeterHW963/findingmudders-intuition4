import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

export default function Landing() {
  const navigate = useNavigate();
  const handleGoToForm = () => {
    navigate("/form");
  };
  const [projects, setProjects] = useState([]);
  const handleAddProject = () => {
    const newProject = {
      id: Date.now(),
      name: "Project ${projects.length + 1}",
      description: "Test project",
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <h1>RicoAI</h1>
      </div>

      <div>
        <button
          style={{
            width: "1000px",
            backgroundColor: "#f0f0f0",
            padding: "16px",
            color: "black",
            fontSize: "25px",
          }}
          onClick={handleGoToForm}
        >
          + Add New Project
        </button>
      </div>

      <div>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            description={project.description}
          ></ProjectCard>
        ))}
      </div>
    </>
  );
}
