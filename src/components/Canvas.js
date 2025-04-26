import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import { useLocation } from "react-router-dom";
import './Canvas.css';

const Canvas = ({ onClear }) => {

  const location = useLocation();

  const canvasRef = useRef(null);
  const canvasEl = useRef(null);
  const [prediction, setPrediction] = useState("");
  const [thinking, setThinking] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);


  const thinkingMessages = [
    "Just a moment...",
    "Let me think...",
    "Hmm...",
    "Analyzing masterpiece...",
    "Interpreting your art...",
    "This is deep..."
  ];

  const getRandomThinkingMessage = () =>
    thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];

  const {
    brushSize = 5,
    brushColor = '#000000',
    darkMode = false
  } = location.state || {};


  useEffect(() => {
    const isMobile = window.innerWidth < 768; 
    const canvasWidth = isMobile ? window.innerWidth * 0.9 : 800;
    const canvasHeight = isMobile ? window.innerWidth * 0.9 * (600 / 800) : 600;
    // Keep the aspect ratio as 800x600 on desktop

    const canvas = new fabric.Canvas(canvasEl.current, {
      isDrawingMode: true,
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: darkMode ? '#222' : '#f0f0f0',
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, [brushSize, brushColor, darkMode]);

  const onSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setThinking(true);
    setPrediction(getRandomThinkingMessage());

    try {
      const base64Image = canvas.getElement().toDataURL("image/png");
      const endpoint = detailedMode ? '/analyze_image_detailed' : '/analyze_image';

      const response = await fetch(`https://drawingaibackend.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const result = await response.text();
      setPrediction(result);
    } catch (error) {
      console.error('Error:', error);
      setPrediction("Error analyzing. Try again!");
    } finally {
      setThinking(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.clear();

      canvas.setBackgroundColor(darkMode ? '#222' : '#f0f0f0', () => {
        canvas.renderAll();
      });

      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;
    }
    setPrediction("");
    if (onClear) onClear();
  };

  return (
    <div className={`canvas-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="scoreboard">
        {thinking ? (
          <h2>{prediction}</h2>
        ) : prediction ? (
          <h2>{detailedMode ? "Analysis:" : "Prediction:"} {prediction}</h2>
        ) : (
          <h2>Draw something and click Save!</h2>
        )}
      </div>

      <canvas ref={canvasEl} id="canvas" width={800} height={600} />

      <div className="controls">
        <Toolbar onClear={handleClear} onSave={onSave} />

        <button
          className={`detail-toggle ${detailedMode ? 'detailed' : ''}`}
          onClick={() => setDetailedMode(!detailedMode)}
        >
          {detailedMode ? "Detailed Mode" : "Simple Mode"}
        </button>
      </div>
    </div>
  );
};

export default Canvas;