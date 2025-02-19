
import React, { useEffect, useRef } from 'react';
import  {fabric}  from 'fabric';
console.log(fabric); // Check the console for the fabric object

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize the Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true, // Enable drawing mode
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
    });

    // Add event listeners or other Fabric.js configurations here
    canvas.on('mouse:up', () => {
      console.log('Drawing stopped');
    });

    // Cleanup on component unmount
    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} id="canvas" />
    </div>
  );
};

export default Canvas;