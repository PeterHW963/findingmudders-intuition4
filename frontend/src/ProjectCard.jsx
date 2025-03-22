import React from "react";
import "./ProjectCard.css";

export default function ProjectCard({ name, description }) {
    return (
        <div
        onClick={onClick} // Make the card clickable
        className="bg-gray-800 p-4 rounded shadow text-white cursor-pointer hover:bg-gray-700 transition"
        >
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-sm">{description}</p>
        </div>
    );
}
