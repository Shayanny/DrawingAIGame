const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();
const port = 3000;

// Set up multer to handle image uploads
const upload = multer({ storage: multer.memoryStorage() });


const HF_API_TOKEN = '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';
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/google/quickdraw';

// Handle POST requests to '/predict' endpoint
app.post('/predict', upload.single('image'), async (req, res) => {
    // Ensure the image file exists
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        // Prepare the image buffer
        const imageBuffer = req.file.buffer;

        // Send the image to Hugging Face API for prediction
        const response = await axios.post(
            HF_MODEL_URL,
            imageBuffer,
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_TOKEN}`,
                    'Content-Type': 'application/octet-stream',
                },
            }
        );

        // The API will return the predicted class
        const prediction = response.data;
        
        // Return the prediction result to the client
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
