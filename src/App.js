import React, { useRef, useEffect } from 'react';
import './App.css';
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import Login from './components/Login';

function App() {
  return (
    <div className="app-container">
    <h1>AI Drawing Game</h1>
    <Login />
    <Canvas/>
  </div>
  );
}

export default App;
