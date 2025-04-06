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

const apiToken = process.env.OP_API_TOKEN;
//const DAapiToken = process.env.DA_API_KEY;

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

    console.log("Received request:", req.body); 

    const { user_input } = req.body;

    if (!image) {
      console.error("No image received");
      return res.status(400).json({ error: "No image received" });
    }

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
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }
    // Construct messages for DeepSeek vision model
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "What is shown in this drawing? Give one word if possible" },
          { type: "image_url", image_url: { url: image}},
        ],
      },
    ];

    // Send request to DeepSeek Vision model
    const response = await client.chat.completions.create({
      model: "qwen/qwen2.5-vl-72b-instruct:free",
      messages: messages,
      max_tokens: 300,
    });

    res.json( response.choices[0]?.message?.content || "No prediction available" );
  
  } catch (error) {
    console.error("Image Processing Error:", error);
     // Ensure error response is sent only ONCE
     if (!res.headersSent) { 
      return res.status(500).json({ error: `Error processing image: ${error.message}` });
    }
    
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

