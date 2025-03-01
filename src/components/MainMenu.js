import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import GameOptions from "./GameOptions";
import Settings from "./Settings";
import AccountPopup from "./AccountPopup";
import "./MainMenu.css"; // Add CSS later for styling

function MainMenu() {
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  return (
    <Router>
      <div className="main-menu">
        <h1>AI Drawing Game</h1>
        <nav>
          <Link to="/game-options" className="menu-button">Play Now</Link>
          <button className="menu-button" onClick={() => setShowAccountPopup(true)}>My Account</button>
          <Link to="/settings" className="menu-button">Settings</Link>
        </nav>
        
        {showAccountPopup && <AccountPopup onClose={() => setShowAccountPopup(false)} />}
      </div>
      
      <Routes>
        <Route path="/game-options" element={<GameOptions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default MainMenu;

