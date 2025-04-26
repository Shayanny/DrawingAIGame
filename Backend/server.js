const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const OpenAi = require('openai');

require('dotenv').config({ path: './.env' });


// Initialize Express app
const app = express();

const apiToken = process.env.OP_API_TOKEN ;

const drawingQueue = [];
let isProcessing = false;


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
      max_tokens: 10,
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

app.post('/analyze_image_detailed', async (req, res) => {
   
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
          { type: "text", text: "Describe this drawing in detail but less than 50 words" },
          { type: "image_url", image_url: { url: image}},
        ],
      },
    ];

    // Send request to DeepSeek Vision model
    const response = await client.chat.completions.create({
      model: "qwen/qwen2.5-vl-72b-instruct:free",
      messages: messages,
      max_tokens: 50,
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



async function processQueue() {
  if (isProcessing || drawingQueue.length === 0) return;
  isProcessing = true;

  const { image, theme, res } = drawingQueue.shift(); // Get the oldest submission

  try {
    const response = await client.chat.completions.create({
      model: "qwen/qwen2.5-vl-72b-instruct:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this drawing be specific in as few words as possible. Respond EXACTLY like: "LABEL: [label]; MATCH: [YES/NO]". Theme: "${theme}"` },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      max_tokens: 200,
    });

    const result = response.choices[0].message.content;
    const label = result.match(/LABEL:\s*(.+?)\s*;/i)?.[1] || "Unknown";
    const match = result.includes("MATCH: YES");

    res.json({ label, match }); // Send back to frontend
  } catch (error) {
    console.error("Queue error:", error);
    res.status(500).json({ error: "AI processing failed" });
  } finally {
    isProcessing = false;
    processQueue(); // Process next in queue
  }
}

// Updated endpoint (now adds to queue instead of blocking)
app.post("/analyze_theme_drawing", (req, res) => {
  const { image, theme } = req.body;
  if (!image || !theme) return res.status(400).json({ error: "Missing data" });

  drawingQueue.push({ image, theme, res }); // Add to queue
  if (!isProcessing) processQueue(); // Start processing if idle
});


// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

