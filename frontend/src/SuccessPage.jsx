import React from "react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();
  const handleChange = () => {
    navigate("/landing");
  };
  return (
    <>
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h1>Success! Project created 🥳</h1>
      </div>
      <div>
        <button onClick={handleChange}>Return Home</button>
      </div>
    </>
  );
}
