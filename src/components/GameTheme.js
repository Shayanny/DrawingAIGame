import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Game.css"; 
import CanvasTheme from './CanvasThemeMode';

function GameTheme() {
  
    const navigate = useNavigate(); 

    const handleBack = () => {
      navigate(-1); // Go back to the previous page
    };

  return (
    <div className="game-container">
    <button className="back-arrow" onClick={handleBack}>
        ← 
      </button>
      <CanvasTheme/>
    </div>
  );
}

export default GameTheme;

