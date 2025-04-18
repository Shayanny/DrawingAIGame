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

    const themes = [
        "Animals",
        "Desserts",
        "Sports",
        "Games",
        "Transport",
        "Flowers"];

    const getRandomTheme = () =>
        themes[Math.floor(Math.random() * themes.length)];

    useEffect(() => {
        // Initialize the Fabric.js canvas
        const canvas = new fabric.Canvas(canvasEl.current, {
            isDrawingMode: true, // Enable drawing mode
            width: 800,
            height: 600,
            backgroundColor: '#f0f0f0',
        });


        // Configure the drawing brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 5; // Default brush size
        canvas.freeDrawingBrush.color = '#000000'; // Default brush color

        // Add event listeners or other Fabric.js configurations here
        canvas.on('mouse:up', () => {
            console.log('Drawing stopped');
        });

        // Store the canvas instance in a ref for later use
        canvasRef.current = canvas;


        // Cleanup on component unmount
        return () => {
            canvas.dispose();

        };
    }, []);

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
      

    const onNext = async () => {
        const canvas = canvasRef.current;
        if (canvas) {

            setThinking(true);
            setPrediction(getRandomThinkingMessage());

            // Get the raw HTML canvas element from the Fabric.js canvas
            const rawCanvas = canvas.getElement();
            // Convert canvas to a Base64 string
            const base64Image = rawCanvas.toDataURL("image/png"); // PNG format


            try {
                const response = await fetch('http://localhost:3000/analyze_image', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64Image, theme: themeMode ? currentTheme : null, }), // Send the form data directly
                });

                if (!response.ok) {
                    throw new Error('Failed to send image for prediction');
                }

                const result = await response.text(); // <-- text now, not JSON
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

        }
    };



    // Handle the clear button click
    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.clear(); //  Clear all Fabric.js objects
            canvas.backgroundColor = "#FFFFFF"; // ✅ Set permanent white background
            canvas.renderAll(); // ✅ Force refresh
        }

        setPrediction("");
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className="canvas-container">
            {themeMode && (
                <div className="theme-info">
                    <h3>Theme: {currentTheme}</h3>
                    <p>⏳ Time Left: {countdown}s</p>
                    <p>✅ Submissions: {submissionCount}</p>
                </div>
            )}

            <button
                onClick={() => {
                    setThemeMode(true);
                    setCurrentTheme(getRandomTheme());
                    setCountdown(60);
                    setSubmissionCount(0);
                    handleClear(); // clear canvas for fresh drawing
                }}
            >
                🎨 Start Theme Challenge
            </button>

            <canvas ref={canvasEl} id="canvas" width={800} height={600} />
            <Toolbar onClear={handleClear} onNext={onNext} />
        </div>
    );
};

export default CanvasTheme;