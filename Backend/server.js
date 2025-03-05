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

app.use(cors({
    origin: 'http://localhost:3001',  // Your React frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, });


const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/gyrojeff/Hyperstroke-VQ-Quickdraw';

// Add a default route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  

// Handle POST requests to '/predict' endpoint
app.post('/predict', async (req, res) => {
    // Ensure that the image is in the body
    const { image } = req.body;
  
    if (!image) {
      return res.status(400).json({ error: 'No image sent for prediction.' });
    }
  
    try {
      // Decode the base64 image string to a buffer
      const base64Data = image.split(',')[1]; // Remove the "data:image/png;base64," part
      const buffer = Buffer.from(base64Data, 'base64');
  
      // Send the buffer to Hugging Face API for prediction
      const response = await axios.post(
        HF_MODEL_URL,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${HF_API_TOKEN}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      );
  
      const prediction = response.data;
  
      // Return the prediction to the client
      res.json(prediction);
    } catch (error) {
      console.error('Error during prediction:', error);
      res.status(500).json({ error: 'Error during prediction.' });
    }
  });
  


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
