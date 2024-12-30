// src/components/LoginButton.js
import React from "react";

const LoginButton = () => {
  const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SPOTIFY_REDIRECT_URI}&scope=user-library-read%20playlist-read-private`;

  return (
    <a href={SPOTIFY_AUTH_URL}>
      <button>Login with Spotify</button>
    </a>
  );
};

export default LoginButton;
