import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import GameOptions from "./GameOptions";
import Settings from "./Settings";
import { useNavigate } from "react-router-dom";
import Canvas from "./Canvas";
import "./Game.css"; 

function Game() {
  
    const navigate = useNavigate(); 

    const handleBack = () => {
      navigate(-1); // Go back to the previous page
    };

  return (
    <div className="game-container">
    <button className="back-arrow" onClick={handleBack}>
        ← 
      </button>
      <Canvas/>
    </div>
  );
}

export default Game;

