import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Toolbar from './ToolbarTheme';
import './CanvasTheme.css';

const CanvasTheme = ({ onClear }) => {
  const canvasRef = useRef(null);
  const canvasEl = useRef(null);

  const [prediction, setPrediction] = useState("");
  const [thinking, setThinking] = useState(false);
  const [themeMode, setThemeMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [preGameCountdown, setPreGameCountdown] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [drawingResults, setDrawingResults] = useState([]);

  const themes = ["Animals", "Desserts", "Sports", "Games", "Transport", "Flowers"];
  const getRandomTheme = () => themes[Math.floor(Math.random() * themes.length)];
  const getRandomThinkingMessage = () => {
    const messages = [
      "Just a moment...",
      "Let me think...",
      "Hmm...",
      "Analyzing masterpiece...",
      "Interpreting your art...",
      "This is deep..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Initialize fabric canvas
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasEl.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
      backgroundColor: '#FFFFFF',
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 5;
    canvas.freeDrawingBrush.color = '#000000';

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  // Game timer countdown
  useEffect(() => {
    let timer;
    if (themeMode && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (themeMode && countdown === 0) {
      setThemeMode(false);
      setShowOverlay(true);
    }
    return () => clearTimeout(timer);
  }, [themeMode, countdown]);

  useEffect(() => {
    if (countdown === 0 && themeMode) {
      console.log("Round over!");
      console.log("Drawings:", drawingResults);
    }
  }, [countdown]);

  useEffect(() => {
    if (!themeMode && countdown === 0 && drawingResults.length > 0) {
      setTimeout(() => {
        alert(`⏰ Time's up! You submitted ${submissionCount} drawings!`);
      }, 100);
    }
  }, [themeMode, countdown, drawingResults]);


  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.clear();
      canvas.setBackgroundColor('#FFFFFF', canvas.renderAll.bind(canvas));
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = '#000000';
    }

    setPrediction("");
    if (onClear) onClear();
  };

  const onNext = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setThinking(true);


    const rawCanvas = canvas.getElement();
    const base64Image = rawCanvas.toDataURL("image/png");

    handleClear();

    try {
      const response = await fetch('http://localhost:3000/analyze_theme_drawing', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          theme: themeMode ? currentTheme : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to send image for prediction');

      const data = await response.json();         // full response is { result: "flower" }
      const result = data.result;                 // extract just the string
      setDrawingResults(prev => [...prev, { input: base64Image, result }]);

      if (themeMode && result.toLowerCase().includes("match")) {
        setSubmissionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending image for prediction:', error);
      setPrediction("Error predicting. Try again!");
    } finally {
      setThinking(false);

    }
  };

  const startGame = () => {
    setPreGameCountdown(3);

    const countdownInterval = setInterval(() => {
      setPreGameCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setPreGameCountdown(null);
          setShowOverlay(false);
          setThemeMode(true);
          setCurrentTheme(getRandomTheme());
          setCountdown(30); // 30 second round
          setSubmissionCount(0);
          setDrawingResults([]);
          handleClear();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="canvas-container">
      {/* Top scoreboard */}
      <div className="scoreboard">
        {themeMode ? (
          <>
            <h3>🎯 Theme: {currentTheme}</h3>
            <p>⏳ {countdown}s | ✅ {submissionCount}</p>
          </>
        ) : (
          <h2>🎮 Theme Challenge Mode</h2>
        )}
      </div>
      <div className="canvas-flex">
        {/* Left column: canvas + toolbar + start overlay */}
        <div className="canvas-column">
          <canvas ref={canvasEl} id="canvas" width={800} height={600} />
          <Toolbar onClear={handleClear} onNext={onNext} thinking={thinking} />

          {showOverlay && (
            <>
              {preGameCountdown === null && (
                <div className="start-overlay">
                  <button className="start-button" onClick={startGame}>
                    🎨 Start Theme Challenge
                  </button>
                </div>
              )}
              {preGameCountdown !== null && (
                <div className="countdown-overlay">
                  <h1>{preGameCountdown}</h1>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column: results (always visible) */}
        <div className="results-side">
          <h3>🧠 Round Results</h3>
          <p>Theme: <strong>{currentTheme}</strong></p>
          {drawingResults.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <ul>
              {drawingResults.map((entry, index) => (
                <li key={index}>{index + 1}. {entry.result}</li>
              ))}
            </ul>
          )}
          {!themeMode && drawingResults.length > 0 && (
            <button onClick={() => setDrawingResults([])}>Close</button>
          )}
        </div>
      </div>
    </div>

  );

};

export default CanvasTheme;
