import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard"; // Import ProjectCard

const randomUrls = [
  { name: "Project Doesn't Matter", url: "https://example.com" },
  { name: "ip: Ai Hoshino", url: "https://google.com" },
  { name: "findingbrUdders", url: "https://github.com" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  const handleGoToForm = () => {
    navigate("/form");
  };

  // Dummy function to fetch data
  const dummyFunction = async () => {
    setLoading(true); // Start loading
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
    setProjects([
      { name: 1, url: "google.com" },
    ]);
    setLoading(false); // Stop loading
  };

  // Fetch data on page load
  useEffect(() => {
    dummyFunction();
  }, []);
 

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

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
        <button
          style={{
            width: "1000px",
            backgroundColor: "green",
            padding: "16px",
            color: "black",
            fontSize: "25px",
            cursor: "pointer",
          }}
          onClick={handleGoToForm}
        >
          + Add New Project
        </button>
      </div>

      {loading ? (
          <p>Loading projects...</p>
            ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {randomUrls.map((site, index) => (
                <button
                  key={index}
                  style={{
                    width: "1000px",
                    backgroundColor: "#f0f0f0",
                    padding: "16px",
                    color: "black",
                    fontSize: "25px",
                    cursor: "pointer",
                  }}
                  onClick={() => window.location.href = site.url}
                >
                  Go to {site.name}
                </button>
              ))}
            </div>
          </>)
        }
    </>
  );
}
