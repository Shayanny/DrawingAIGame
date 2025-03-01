import React, { useState, useEffect } from "react";
import { auth, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
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
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={logOut}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Login</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={() => signInWithEmail(email, password)}>Login</button>
          <button onClick={() => signUpWithEmail(email, password)}>Sign Up</button>
          <button onClick={signInWithGoogle}>Login with Google</button>
        </div>
      )}
    </div>
  );
};

export default Login;
