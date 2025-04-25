import React, { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import "./GameOptions.css"; 



function GameOptions() {

  const location = useLocation();
  const navigate = useNavigate(); 

  const { brushSize, brushColor, darkMode } = location.state || {};

  const startGame = (gameMode) => {
    navigate(`/${gameMode}`, {
      state: {
        brushSize,
        brushColor,
        darkMode
      }
    });
  };

    const handleBack = () => {
      navigate(-1); // Go back to the previous page
    };

  return (
    
    <div className="menu-container">
       <button className="back-arrow" onClick={handleBack}>
        ← 
      </button>
       <div className="top-blue-bar">
      <h1 className="title">Draw AI</h1>
      </div>
      <div className="menu-buttons">
        <button className="menu-button red" onClick={() => startGame("game")}>
          Play Original Guesser
        </button>
        <button className="menu-button yellow" onClick={() => startGame("game-theme")}>
         Play Theme Guesser
        </button>
      </div>
   </div>
    
  );
}

export default GameOptions;