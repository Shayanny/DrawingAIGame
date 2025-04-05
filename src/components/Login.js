import React, { useState, useEffect } from "react";
import { auth, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Login.css";


const Login = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div className="login-container">
      <button className="login-button back" onClick={onBack}>Back</button>
      {user ? (
        <div className="login-logged-in">
          <p>Welcome, {user.email}!</p>
          <button className="login-button" onClick={logOut}>Logout</button>
        </div>
      ) : (
        <div className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button className="login-button" onClick={() => signInWithEmail(email, password)}>Login</button>
          <button className="login-button" onClick={() => signUpWithEmail(email, password)}>Sign Up</button>
          <button className="login-button google" onClick={signInWithGoogle}>Login with Google</button>
        </div>
      )}
    </div>
  );
};

export default Login;
