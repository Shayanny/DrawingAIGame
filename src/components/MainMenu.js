import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import SettingsPopup from "./SettingsPopup";
import { useNavigate } from "react-router-dom";
import AccountPopup from "./AccountPopup";
import "./MainMenu.css"; // Add CSS later for styling

function MainMenu() {
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const navigate = useNavigate();

  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [darkMode, setDarkMode] = useState(false);


  return (
    <div className="menu-container">
      <div className="top-blue-bar">
        <h1 className="title">Draw AI</h1>
      </div>
      <div className="menu-buttons">
        <button className="menu-button red" onClick={() => navigate("/game-options", {
          state: { brushSize, brushColor, darkMode }
        })}>
          Play Now
        </button>
        <button className="menu-button yellow" onClick={() => setShowAccountPopup(true)}>
          My Account
        </button>
        <button className="menu-button green" onClick={() => setShowSettingsPopup(true)}>
          Settings
        </button>
      </div>

      {showAccountPopup && <AccountPopup onClose={() => setShowAccountPopup(false)} />}
      {showSettingsPopup && (
        <SettingsPopup
          onClose={() => setShowSettingsPopup(false)}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
    </div>
  );
}

export default MainMenu;

