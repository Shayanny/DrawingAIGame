import React, { useRef, useEffect } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import GameOptions from './components/GameOptions';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Game from './components/Game';
import GameTheme from './components/GameTheme';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element ={<Game /> }/> 
        <Route path="/game-theme" element ={<GameTheme /> }/> 
        <Route path="/game-options" element={<GameOptions />} />
      </Routes>
    </Router>
  );
}

export default App;
