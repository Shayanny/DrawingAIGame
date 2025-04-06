import Toolbar from './Toolbar';
import React, { useEffect, useRef , useState} from 'react';
import { fabric } from 'fabric';
import './Canvas.css'; 


const Canvas = ({ onClear }) => {
  const canvasRef = useRef(null);
  const canvasEl = useRef(null);

  const [prediction, setPrediction] = useState("");
  const [thinking, setThinking] = useState(false);

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

  const onSave = async () => {
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
          body: JSON.stringify({ image: base64Image }), // Send the form data directly
        });

        if (!response.ok) {
          throw new Error('Failed to send image for prediction');
        }

        const result = await response.text(); // <-- text now, not JSON
        setPrediction(result);
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
      <div className="scoreboard">
      {thinking ? (
        <h2>{prediction}</h2> 
      ) : prediction ? (
        <h2>Prediction: {prediction}</h2>
      ) : (
        <h2>Draw something and click Save!</h2>
      )}
      </div>
      <canvas ref={canvasEl} id="canvas" width={800} height={600} />
      <Toolbar onClear={handleClear} onSave={onSave} />
    </div>
  );
};

export default Canvas;