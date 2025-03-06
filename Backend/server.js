const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const OpenAi = require('openai');

require('dotenv').config();


// Initialize Express app
const app = express();
const port = 3000;

const apiToken = process.env.OP_API_KEY;

app.use(cors({
    origin: 'http://localhost:3001',  
    methods: ['GET', 'POST', 'FETCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

// Initialize OpenAI client with OpenRouter
const client = new OpenAi({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiToken,
});

app.use(express.json({ limit: '100mb' }));  // Allows JSON parsing
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Allows form data parsing


// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, });


// Add a default route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World!');
  });

// Chat API Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { user_input } = req.body;

    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-r1-distill-llama-70b:free",
      messages: [{ role: "user", content: user_input }],
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Image Analysis API Endpoint
app.post("/analyze_image", async (req, res) => {
  try {
    let { image } = req.body;

    // Remove "data:image/png;base64," if present
    if (image.includes(",")) {
      image = image.split(",")[1];
    }

    // Construct messages for DeepSeek vision model
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "What is shown in this drawing? Give a simple but detailed description." },
          { type: "image_url", image_url: { url: `data:image/png;base64,${image}` } },
        ],
      },
    ];

    // Send request to DeepSeek Vision model
    const response = await client.chat.completions.create({
      model: "deepseek/deepseek-vis-7b-chat:free",
      messages: messages,
      max_tokens: 300,
    });

    res.json({ prediction: response.choices[0].message.content });
  } catch (error) {
    console.error("Image Processing Error:", error);
    res.status(400).json({ error: `Error processing image: ${error.message}` });
  }
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

