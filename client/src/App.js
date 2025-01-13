import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginButton from "./components/LoginButton";
import Callback from "./components/Callback";
import Navigator from "./components/Navigator";


export default function App() {
  return (
    <Router basename="/playlist_abacus">
        <Routes>
            <Route path="/" element={<LoginButton />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/navigator" element={<Navigator />} />
        </Routes>
    </Router>
  );
}
