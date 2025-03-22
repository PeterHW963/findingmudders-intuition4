import React from "react";
import { useEffect, useState } from "react";
import Landing from "./Landing";

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_KEY;

export default function SignIn() {
  const [rerender, setRerender] = useState(false);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);

    if (codeParam && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, {
          method: "GET",
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.access_token) {
              localStorage.setItem("accessToken", data.access_token);
              setRerender(!rerender);
            }
          });
      }

      getAccessToken();
      getUserData();
    }
  }, []);

  async function getUserData() {
    await fetch("http://localhost:4000/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"), //bearer access token
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  }

  function accessForm() {
    console.log("FORM CLICKED");
  }

  function loginWithGithub() {
    window.location.assign(
      "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID
    );
  }

  return (
    <>
      {localStorage.getItem("accessToken") ? (
        <>
          <Landing />
        </>
      ) : (
        <>
          <div className="min-h-screen flex flex-col">
            <h1>RicoAI</h1>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 max-w-xl w-full mx-auto">
            <h2 className="text-2xl font-bold text-center">Sign In</h2>
          </div>
          <button onClick={loginWithGithub}>
            Sign in using GitHub account
          </button>
        </>
      )}
    </>
  );
}
