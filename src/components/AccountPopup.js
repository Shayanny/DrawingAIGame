import React, {useState} from "react";
import "./AccountPopup.css";
import Login from "./Login";
import {logOut} from "../firebase";

function AccountPopup({ onClose }) {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>My Account</h2>
        <br></br>

        {showLogin ? (
          <Login onBack={() => setShowLogin(false)} />
          ) : (
          <div className="popup-buttons">
            <button
              onClick={() => setShowLogin(true)}
              className="popup-button"
            >
              Login
            </button>
            <button
              onClick={() =>  logOut}
              className="popup-button"
            >
              Logout
            </button>
          </div>
        )}
        <br></br>
        <button onClick={onClose} className="popup-close">Close</button>
      </div>
    </div>
  );
}

export default AccountPopup;
