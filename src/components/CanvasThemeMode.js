import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Toolbar from './ToolbarTheme';
import { useLocation } from "react-router-dom";
import './CanvasTheme.css';

const CanvasTheme = ({ onClear }) => {
  const location = useLocation();
  const canvasRef = useRef(null);
  const canvasEl = useRef(null);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [thinking, setThinking] = useState(false);
  const [themeMode, setThemeMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [preGameCountdown, setPreGameCountdown] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [drawingResults, setDrawingResults] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { 
    brushSize = 5, 
    brushColor = '#000000',
    darkMode = false 
  } = location.state || {};

  const themes = ["Animals", "Desserts", "Sports", "Games", "Transport", "Food"];
  const getRandomTheme = () => themes[Math.floor(Math.random() * themes.length)];
  const getRandomThinkingMessage = () => {
    const messages = [
      "Just a moment...",
      "Let me think...",
      "Hmm...",
      "Analyzing masterpiece...",
      "Interpreting your art...",
      "This is deep...",
      "Oh wow..",
      "Very.... interesting.."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Initialize fabric canvas
  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth <= 768;
      setIsMobile(mobileCheck);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        if (mobileCheck) {
          const newWidth = window.innerWidth * 0.9;
          canvas.setWidth(newWidth);
          canvas.setHeight(newWidth * 0.75);
        } else {
          canvas.setWidth(800);
          canvas.setHeight(600);
        }
        canvas.calcOffset();
        canvas.renderAll();
        if (isMobile) {
          canvas.on('mouse:down', (e) => {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
          });
          
          canvas.on('mouse:up', (e) => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
          });
        }
      }
      
    };

    const initCanvas = () => {
      const baseWidth = isMobile ? window.innerWidth * 0.9 : 800;
      const baseHeight = isMobile ? baseWidth * 0.75 : 600;

      const canvas = new fabric.Canvas(canvasEl.current, {
        isDrawingMode: true,
        width: baseWidth,
        height: baseHeight,
        backgroundColor: darkMode ? '#222' : '#f0f0f0',
      });

      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;

      // Mobile-specific touch handling
      if (isMobile) {
        canvas.selection = false;
        canvas.on('touch:start', (e) => {
          if (e.e.touches.length === 1) {
            canvas.isDrawingMode = true;
          } else {
            canvas.isDrawingMode = false;
          }
        });
      }

      canvasRef.current = canvas;
      window.addEventListener('resize', handleResize);
    };

    initCanvas();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      canvasRef.current = null;
    };
  }, [brushSize, brushColor, darkMode, isMobile]);

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

  // Handle end-of-game submission
  useEffect(() => {
    if (countdown === 0 && themeMode && !hasAutoSubmitted) {
      const canvas = canvasRef.current;
      if (canvas && !canvas.isEmpty()) {
        setHasAutoSubmitted(true);
        setIsAutoSubmitting(true);
        const base64Image = canvas.getElement().toDataURL("image/png");

        setTimeout(async () => {
          try {
            const response = await fetch('https://drawingaibackend.onrender.com/analyze_theme_drawing', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: base64Image,
                theme: currentTheme
              }),
            });

            const data = await response.json();

            setDrawingResults(prev => {
              const alreadyExists = prev.some(item => item.input === base64Image);
              return alreadyExists ? prev : [...prev, {
                input: base64Image,
                result: data.label,
                match: data.match,
                isAutoSubmitted: true
              }];
            });

            if (data.match) {
              setSubmissionCount(prev => prev + 1);
              setTotalPoints(prev => prev + 10);
            }
          } catch (error) {
            console.error('Auto-submit error:', error);
            setDrawingResults(prev => [...prev, {
              input: base64Image,
              result: "Unknown",
              match: false,
              isAutoSubmitted: true
            }]);
          } finally {
            setIsAutoSubmitting(false);
            handleClear();
          }
        }, 500);
      } else {
        handleClear();
      }
      setThemeMode(false);
    }
  }, [countdown, themeMode, hasAutoSubmitted]);

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

  const onNext = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isProcessing) return;

    const base64Image = canvas.getElement().toDataURL("image/png");
    handleClear();

    setPendingSubmissions(prev => prev + 1);
    setIsProcessing(true);

    try {
      const response = await fetch('https://drawingaibackend.onrender.com/analyze_theme_drawing', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, theme: currentTheme }),
      });

      const data = await response.json();

      setDrawingResults(prev => [...prev, {
        input: base64Image,
        result: data.label,
        match: data.match
      }]);

      if (data.match) {
        setSubmissionCount(prev => prev + 1);
        setTotalPoints(prev => prev + 10);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setPendingSubmissions(prev => prev - 1);
      setIsProcessing(false);
    }
  };

  const startGame = () => {
    setHasAutoSubmitted(false);
    setPendingSubmissions(0);
    setIsProcessing(false);
    setThinking(false);
    setDrawingResults([]);
    setTotalPoints(0);
    setSubmissionCount(0);
    setAutoSubmitted(false);
    handleClear();
    setPreGameCountdown(3);
    setShowOverlay(true);

    const countdownInterval = setInterval(() => {
      setPreGameCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setPreGameCountdown(null);
          setShowOverlay(false);
          setThemeMode(true);
          setCurrentTheme(getRandomTheme());
          setCountdown(30);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      setPendingSubmissions(0);
      setIsProcessing(false);
      setThinking(false);
    };
  }, []);

  return (
    <div className={`canvas-container theme-mode ${darkMode ? 'dark-mode' : ''} ${isMobile ? 'mobile' : ''}`}>
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
        <div className="canvas-column">
          <div className="canvas-wrapper">
            <canvas ref={canvasEl} id="canvas" />
            
            {showOverlay && preGameCountdown !== null && (
              <div className="countdown-overlay">
                <h1>{preGameCountdown}</h1>
              </div>
            )}
          </div>

          <Toolbar onClear={handleClear} onNext={onNext} thinking={thinking} />

          {showOverlay && preGameCountdown === null && (
            <div className="start-overlay">
              <button className="start-button" onClick={startGame}>
                🎨 Start Theme Challenge
              </button>
            </div>
          )}
        </div>

        {!isMobile && (
          <div className={`results-side ${darkMode ? 'dark' : ''}`}>
            <h3>🧠 Round Results</h3>
            <p>Theme: <strong>{currentTheme}</strong></p>
            
            {isAutoSubmitting && (
              <p className="processing-status">⏳ Analyzing your final drawing...</p>
            )}
            {(pendingSubmissions > 0 || thinking) && (
              <p className="processing-status">
                🔄 Processing {pendingSubmissions} drawing{pendingSubmissions !== 1 ? 's' : ''}...
              </p>
            )}

            {drawingResults.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <ul>
                {drawingResults.map((entry, index) => (
                  <li key={index} className={entry.isAutoSubmitted ? 'final-submission' : ''}>
                    {index + 1}. {entry.result}
                    {entry.match ? " ✅" : " ❌"}
                    {entry.isAutoSubmitted && " (Final)"}
                    {entry.result === "Unknown" && " - Couldn't analyze"}
                  </li>
                ))}
              </ul>
            )}
            <p>Total Score: {totalPoints} points</p>
          </div>
        )}
      </div>

      {isMobile && (
        <div className={`mobile-results-panel ${darkMode ? 'dark' : ''}`}>
          <h3>🧠 Round Results</h3>
          <p>Theme: <strong>{currentTheme}</strong></p>
          
          {isAutoSubmitting && (
            <p className="processing-status">⏳ Analyzing your final drawing...</p>
          )}
          {(pendingSubmissions > 0 || thinking) && (
            <p className="processing-status">
              🔄 Processing {pendingSubmissions} drawing{pendingSubmissions !== 1 ? 's' : ''}...
            </p>
          )}

          {drawingResults.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <ul>
              {drawingResults.map((entry, index) => (
                <li key={index} className={entry.isAutoSubmitted ? 'final-submission' : ''}>
                  {index + 1}. {entry.result}
                  {entry.match ? " ✅" : " ❌"}
                  {entry.isAutoSubmitted && " (Final)"}
                  {entry.result === "Unknown" && " - Couldn't analyze"}
                </li>
              ))}
            </ul>
          )}
          <p>Total Score: {totalPoints} points</p>
        </div>
      )}
    </div>
  );
};

export default CanvasTheme;