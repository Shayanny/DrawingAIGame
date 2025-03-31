import Toolbar from './Toolbar';
import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import './Canvas.css'; 


const Canvas = ({ onClear }) => {
  const canvasRef = useRef(null);
  const canvasEl = useRef(null);

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

        const prediction = await response.json();
        console.log('Prediction result:', prediction);

        // Display prediction result in the UI
        alert(`AI Prediction: ${JSON.stringify(prediction)}`);
      } catch (error) {
        console.error('Error sending image for prediction:', error);
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

    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasEl} id="canvas" width={800} height={600} />
      <Toolbar onClear={handleClear} onSave={onSave} />
    </div>
  );
};

export default Canvas;