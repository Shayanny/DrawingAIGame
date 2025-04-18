import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import GameOptions from "./GameOptions";
import Settings from "./Settings";
import { useNavigate } from "react-router-dom";
import AccountPopup from "./AccountPopup";
import "./MainMenu.css"; // Add CSS later for styling

function MainMenu() {
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const navigate = useNavigate();


  return (
    <div className="menu-container">
       <div className="top-blue-bar">
      <h1 className="title">Draw AI</h1>
      </div>
      <div className="menu-buttons">
        <button className="menu-button red" onClick={() => navigate("/game")}>
          Play Now
        </button>
        <button className="menu-button yellow" onClick={() => setShowAccountPopup(true)}>
          My Account
        </button>
        <button className="menu-button green" onClick={() => navigate("/settings")}>
         Settings
        </button>
      </div>

      {showAccountPopup && <AccountPopup onClose={() => setShowAccountPopup(false)} />}
    </div>
  );
}

export default MainMenu;

