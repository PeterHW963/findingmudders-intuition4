import React from "react";
import { useEffect, useState } from "react";
import Landing from "./Landing";
import { Button, Box } from "@mui/material";
import { GitHubIcon } from "./assets/githubicon";
import "./App.css";

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
        await fetch(
          "https://ricoai1-526454760b6c.herokuapp.com/getAccessToken?code=" +
            codeParam,
          {
            method: "GET",
          }
        )
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
    await fetch("https://ricoai1-526454760b6c.herokuapp.com/getUserData", {
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
          <div>
            <h1
              style={{
                color: "black",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              RicoAI
            </h1>
          </div>
          <Box
            sx={{
              minHeight: "20vh",
              mx: "auto",
              mt: 5,
              maxWidth: "25vw",
              backgroundColor: "white",
              color: "black",
              display: "flex",
              border: "1px solid black",
              borderRadius: "10px",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "top",
              p: 4,
            }}
          >
            <div className="bg-white rounded-xl shadow-md p-8 max-w-xl w-full mx-auto">
              <h2 className="text-2xl font-bold text-center">Sign In</h2>
            </div>
            <Button
              variant="outlined"
              onClick={loginWithGithub}
              startIcon={<GitHubIcon />}
              sx={{
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                  borderColor: "black",
                },
              }}
              color="black"
              borderColor="black"
            >
              Sign in using GitHub account
            </Button>
          </Box>
        </>
      )}
    </>
  );
}
