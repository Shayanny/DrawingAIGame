import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import "./SettingsPopup.css";

function SettingsPopup({  onClose, 
  brushSize, 
  setBrushSize, 
  brushColor, 
  setBrushColor, 
  darkMode, 
  setDarkMode  }) {

  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorPresets = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  return (
    <div className={`popup ${darkMode ? 'dark' : ''}`}>
      <div className="popup-content">
        <h2>Settings</h2>
        <br />

        {/* Theme Toggle */}
        <div className="setting-item">
          <label>Dark Mode</label>
          <div className={`toggle-switch ${darkMode ? 'dark' : ''}`}>
            <input 
              type="checkbox" 
              id="dark-mode-toggle" 
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <label htmlFor="dark-mode-toggle" className="toggle-slider"></label>
          </div>
        </div>

        {/* Brush Size */}
        <div className="setting-item">
          <label>Brush Size: {brushSize}px</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="brush-slider"
          />
        </div>

        {/* Color Picker */}
        <div className="setting-item">
          <label>Brush Color</label>
          <div className="color-options">
            {colorPresets.map((color) => (
              <button
                key={color}
                className="color-swatch"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setBrushColor(color);
                  setShowColorPicker(false);
                }}
              />
            ))}
            <button 
              className="color-swatch custom"
              style={{ backgroundColor: brushColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              +
            </button>
          </div>
          {showColorPicker && (
            <div className="color-picker-container">
              <HexColorPicker color={brushColor} onChange={setBrushColor} />
              <button 
                onClick={() => setShowColorPicker(false)}
                className="popup-button"
              >
                Select Color
              </button>
            </div>
          )}
        </div>

        <br />
        <button onClick={onClose} className="popup-close">Close</button>
      </div>
    </div>
  );
}

export default SettingsPopup;