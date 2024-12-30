import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginButton from "./components/LoginButton";
import Callback from "./components/Callback";
import Playlists from "./components/Playlists";
import Navigator from "./components/Navigator";


export default function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<LoginButton />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/navigator" element={<Navigator />} />
        </Routes>
    </Router>
  );
}
