import React, { useRef, useEffect } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import GameOptions from './components/GameOptions';
import Settings from './components/Settings';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Canvas from './components/Canvas';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element ={<Canvas /> }/> 
        <Route path="/game-options" element={<GameOptions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
