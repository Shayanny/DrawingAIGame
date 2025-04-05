import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import GameOptions from "./GameOptions";
import Settings from "./Settings";
import { useNavigate } from "react-router-dom";
import Canvas from "./Canvas";

import "./Game.css"; // Add CSS later for styling

function Game() {
  const navigate = useNavigate();

  return (
    <div className="game-container">
       <div className="top-green-bar">
      <h1 className="title">Draw AI</h1>
      </div>
      <Canvas/>

  
    </div>
  );
}

export default Game;

