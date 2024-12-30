// src/components/Callback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    console.log("code", code);
    console.log("redirect_uri", process.env.REACT_APP_SPOTIFY_REDIRECT_URI);
    console.log("client_id", process.env.REACT_APP_SPOTIFY_CLIENT_ID);

    if (code) {
      // Exchange code for access token
      let token = btoa(`${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`);
      axios
        .post("https://accounts.spotify.com/api/token", {
          code,
          redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
          client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
          client_secret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
          grant_type: "authorization_code",
        }, {headers: {
            'Authorization': 'Basic ' + token,
            'Content-Type': 'application/x-www-form-urlencoded',
        }})
        .then((response) => {
          localStorage.setItem("spotifyAccessToken", response.data.access_token);
          navigate("/playlists");
        })
        .catch((err) => console.error("Error exchanging code:", err));
    }
  }, [navigate]);

  return <div>Authorizing...</div>;
};

export default Callback;
