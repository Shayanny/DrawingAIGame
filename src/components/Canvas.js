import Toolbar from './Toolbar';
import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';


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
        const dataURL = canvas.toDataURL({ format: 'png' });

        try {
            const response = await fetch('http://localhost:3000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataURL }),
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
      canvas.clear();
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div>
      <canvas ref={canvasEl} id="canvas" width={800} height={600} />
      <Toolbar onClear={handleClear} onSave={onSave} />
    </div>
  );
};

export default Canvas;