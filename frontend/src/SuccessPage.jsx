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
          fontFamily: "Roboto, Arial, sans-serif",
        }}
      >
        <h1 style={{ fontFamily: "Roboto, Arial, sans-serif" }}>
          Success! Project created 🥳
        </h1>
      </div>
      <div>
        <button onClick={handleChange}>Return Home</button>
      </div>
    </>
  );
}
