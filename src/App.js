import React, { useRef, useEffect } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import Canvas from './components/Canvas';

function App() {
  return (
    <div className="app-container">
    <Canvas />
  </div>
  );
}

export default App;
