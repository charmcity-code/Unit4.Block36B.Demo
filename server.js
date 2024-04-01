const express = require("express");
const axios = require("axios");
const app = express();
// Load environment variables from .env file
require("dotenv").config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.get("/", (req, res) => {
  res.send(/* html */ `
    <h1>Welcome to our Application</h1>
    <button onclick="window.location.href = '/login/github';">Login with GitHub</button>
  `);
});

app.get("/login/github", (req, res) => {
  // Construct the GitHub authorization URL with client ID and scope
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`;
  // Redirect the user to the GitHub authorization URL
  res.redirect(githubUrl);
});

// Authorization callback URL
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      },
      { headers: { accept: "application/json" } }
    );

    const accessToken = response.data.access_token;
    // Redirect to frontend with the access token
    res.redirect(`/user?access_token=${accessToken}`);
  } catch (error) {
    console.error("Error during authentication:", error);
    res.send("Authentication failed");
  }
});

let accessToken;
let gitName;
app.get("/user", async (req, res) => {
  // Retrieve the access token from the query parameters
  accessToken = req.query.access_token;
  await githubUser();
  res.send(/* html */ `
    <h1>Authenticated User Page</h1>
    <h3>Welcome ${gitName}</h3>
    <p>Your GitHub Access Token: ${accessToken}</p>
    
  `);
});

// Get the authenticated user info from GitHub
const githubUser = async () => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const result = await response.json();
  console.log(result);
  gitName = result.name;
};

app.listen(3000, () => console.log("Listening on port 3000"));
