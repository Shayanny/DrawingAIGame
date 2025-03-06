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
const PYTHON_API_URL = 'http://localhost:8000/generate';

app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'FETCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json({ limit: '10mb' }));  // Allows JSON parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Allows form data parsing


// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, });


const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/gyrojeff/Hyperstroke-VQ-Quickdraw';

// Add a default route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  


  app.post('/predict', async (req, res) => {
    const { messages } = req.body;
  
    // Check if messages exist in the request body
    if (!messages) {
      return res.status(400).send('Messages not found');
    }
  
    try {
      const response = await fetch(PYTHON_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      res.json(data);  // Send back the response from the Python backend
    } catch (error) {
      console.error('Error with Python API:', error);
      res.status(500).send('Error with Python API');
    }
  });


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

