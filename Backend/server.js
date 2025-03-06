const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();


// Initialize Express app
const app = express();
const port = 3000;

//Python backend
const PYTHON_API_URL = 'http://localhost:8000/analyze_image';

app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'FETCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json({ limit: '100mb' }));  // Allows JSON parsing
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Allows form data parsing


// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, });


// Add a default route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  app.post('/predict', async (req, res) => {
    const { image } = req.body;  // Get the base64 image from the request
  
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    try {
       // Send the image to the FastAPI AI server
       const response = await axios.post(
        'http://localhost:8000/analyze_image',
        { image },
        {
            headers: { 'Content-Type': 'application/json' }
        }
        
      );

        // Return the AI's response
        res.json(response.data);
    } catch (error) {
        console.error('Error sending image to Deepseek:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});


  


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

