import Toolbar from './Toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
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
  const [showOverlay, setShowOverlay] = useState(true); // controls start/countdown overlays

  const themes = ["Animals", "Desserts", "Sports", "Games", "Transport", "Flowers"];
  const getRandomTheme = () => themes[Math.floor(Math.random() * themes.length)];
  const getRandomThinkingMessage = () => {
    const thinkingMessages = [
      "Just a moment...",
      "Let me think...",
      "Hmm...",
      "Analyzing masterpiece...",
      "Interpreting your art...",
      "This is deep..."
    ];
    return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
  };

  // Initialize canvas once
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

  // Game countdown
  useEffect(() => {
    let timer;
    if (themeMode && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (themeMode && countdown === 0) {
      alert(`Time's up! You submitted ${submissionCount} drawings!`);
      setThemeMode(false);
    }
    return () => clearTimeout(timer);
  }, [themeMode, countdown]);

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
    setPrediction(getRandomThinkingMessage());

    const rawCanvas = canvas.getElement();
    const base64Image = rawCanvas.toDataURL("image/png");

    try {
      const response = await fetch('http://localhost:3000/analyze_image', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          theme: themeMode ? currentTheme : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to send image for prediction');
      const result = await response.text();
      setPrediction(result);

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
          setShowOverlay(false); // 🔥 remove overlays entirely
          setThemeMode(true);
          setCurrentTheme(getRandomTheme());
          setCountdown(60);
          setSubmissionCount(0);
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

      {/* Canvas */}
      <canvas ref={canvasEl} id="canvas" width={800} height={600} />
      <Toolbar onClear={handleClear} onNext={onNext} />

      {/* Overlays (start + countdown) */}
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
  );
};

export default CanvasTheme;
