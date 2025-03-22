import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import axios from "axios";
import { Button } from "@mui/material";

export default function Landing() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const { sharedState } = useContext(AppContext);

  const handleGoToForm = () => {
    navigate("/form");
  };

  // Dummy function to fetch data
  const dummyFunction = async () => {
    if (sharedState.githubUsername) {
      console.log(sharedState.githubUsername);
    } else {
      console.log("guest");
    }
  };

  const fetchUserProjects = async () => {
    // Check if the GitHub username is available from context
    if (!sharedState.githubUsername) {
      console.log("GitHub username not available. Cannot fetch projects.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "https://ricoai1-526454760b6c.herokuapp.com/projects",
        {
          params: {
            username: sharedState.githubUsername,
          },
        }
      );
      setProjects(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch user projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    dummyFunction();
    fetchUserProjects();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <h1 style={{ fontFamily: "Roboto, Arial, sans-serif" }}>RicoAI</h1>
      </div>

      <div
        style={{
          gap: "10px",
          marginBottom: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={handleGoToForm}
          sx={{
            backgroundColor: loading ? "#666" : "black",
            color: "white",
            "&:hover": {
              backgroundColor: loading ? "#666" : "#333",
            },
            width: 800,
            height: 50,
          }}
        >
          + Add New Project
        </Button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length > 0 ? (
        <div
          style={{
            gap: "10px",
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {projects.map((project) => (
            <Button
              variant="outlined"
              onClick={() => window.open(project.github_repo_link, "_blank")}
              sx={{
                borderColor: "black",
                color: "black",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  borderColor: "black",
                },
                width: 800,
                height: 50,
              }}
            >
              {project.title}
            </Button>
          ))}
        </div>
      ) : (
        <p>No projects found.</p>
      )}
    </>
  );
}
