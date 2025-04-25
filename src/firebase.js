import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut , createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAM4H_ITy_Dyde_aVXKqgOAONBSzb8VA1c",
    authDomain: "drawingai-f48d3.firebaseapp.com",
    projectId: "drawingai-f48d3",
    storageBucket: "drawingai-f48d3.firebasestorage.app",
    messagingSenderId: "64598115556",
    appId: "1:64598115556:web:7fcb49573810766e2798f1",
    measurementId: "G-ZL4FWGJBW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Email/Password Sign-Up
const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };
  
  // Email/Password Sign-In
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

// Function to handle Logout
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export { auth, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut };

