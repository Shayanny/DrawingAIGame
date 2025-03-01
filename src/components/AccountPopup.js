import React from "react";
import "./AccountPopup.css"; 

function AccountPopup({ onClose }) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>My Account</h2>
        <div className="popup-buttons">
          <button onClick={() => console.log("Login action")} className="popup-button">Login</button>
          <button onClick={() => console.log("Logout action")} className="popup-button">Logout</button>
          <button onClick={onClose} className="popup-close">Close</button>
        </div>
      </div>
    </div>
  );
}

export default AccountPopup;
