import React from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <h1>RicoAI</h1>
      </div>
      <div className="bg-white rounded-xl shadow-md p-8 max-w-xl w-full mx-auto">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
      </div>
      <div>
        <button>Sign In using GitHub</button>
      </div>
    </>
  );
}
