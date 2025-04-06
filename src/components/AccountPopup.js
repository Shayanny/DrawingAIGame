import React, { useState, useEffect } from "react";
import "./AccountPopup.css";
import Login from "./Login";
import { auth, logOut } from "../firebase";
import { updateProfile } from "firebase/auth";

function AccountPopup({ onClose }) {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editUsername, setEditUsername] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.displayName || user.email);
      } else {
        setIsLoggedIn(false);
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUsernameChange = async () => {
    try {
      if (auth.currentUser && newUsername.trim() !== "") {
        await updateProfile(auth.currentUser, { displayName: newUsername });
        setUsername(newUsername);
        setNewUsername("");
        setEditUsername(false); // hide input after saving
        alert("Username updated!");
      }
    } catch (error) {
      console.error("Failed to update username:", error);
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>My Account</h2>
        <br />

        {isLoggedIn ? (
          <>
            <p><strong>Username:</strong> {username}</p>

            {editUsername ? (
              <>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New username"
                  className="popup-input"
                />
                <button onClick={handleUsernameChange} className="popup-button">
                  Save
                </button>
                <button onClick={() => setEditUsername(false)} className="popup-button">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditUsername(true)} className="popup-button">
                Change Username
              </button>
            )}

            <button onClick={logOut} className="popup-button">Logout</button>
          </>
        ) : showLogin ? (
          <Login onBack={() => setShowLogin(false)} />
        ) : (
          <div className="popup-buttons">
            <button onClick={() => setShowLogin(true)} className="popup-button">
              Login
            </button>
          </div>
        )}

        <br />
        <button onClick={onClose} className="popup-close">Close</button>

      </div>
    </div>
  );
}

export default AccountPopup;
