import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const handleGoToForm = () => {
    navigate("/form");
  };
  const [projects, setProjects] = useState([]);
  const handleAddProject = () => {
    const newProject = {
      id: Date.now(),
      name: `New Project ${projects.length + 1}`,
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <h1>RicoAI</h1>
      </div>

      <div>
        <button onClick={handleGoToForm}>+ Add New Project</button>
      </div>

      <div>
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-800 p-4 rounded shadow text-lg"
          >
            {project.name}
          </div>
        ))}
      </div>
    </>
  );
}
