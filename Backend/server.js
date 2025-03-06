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
const PYTHON_API_URL = 'http://127.0.0.1:8000/analyze_image';

app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'FETCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json({ limit: '100mb' }));  // Allows JSON parsing
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Allows form data parsing


// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, });


// Add a default route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }
  
      // The uploaded image is in memory, stored in req.file.buffer
      const imageBuffer = req.file.buffer;
      console.log('Uploaded image buffer received:', imageBuffer);
  
      // Send the image to the external API for analysis (or perform any other processing)
      const response = await axios.post('http://127.0.0.1:8000/analyze_image', {
        image: imageBuffer.toString('base64'), // Send the image in base64 format
      });
  
      console.log('API Response:', response.data);
  
      res.json({
        message: 'Image processed successfully!',
        data: response.data,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).send('Error processing image');
    }
});


  


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

