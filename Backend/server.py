from openai import OpenAI
import os
from dotenv import load_dotenv
from io import BytesIO
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import uvicorn
import base64
from PIL import Image

app = FastAPI()

# Load environment variables from .env file
load_dotenv()

# Get the token
api_token = os.getenv("OP_API_TOKEN")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key= api_token,
)

# Define request models
class ChatRequest(BaseModel):
    user_input: str

class ImageRequest(BaseModel):
    image: str  # Base64-encoded image


@app.post("/chat")
async def chat(user_input: str):
    completion = client.chat.completions.create(
        model="deepseek/deepseek-r1-distill-llama-70b:free",
        messages=[{"role": "user", "content": user_input}]
    )
    return {"response": completion.choices[0].message.content}

# Image Analysis API
@app.post("/analyze_image")
async def analyze_image(request: ImageRequest):
    try:
        # Extract base64 image from request
        image_data = request.image
        # Handle the case where the image might or might not have a data URI prefix
        if "," in image_data:
            image_data = image_data.split(",")[1]  # Remove the "data:image/png;base64," part
            
        image_bytes = base64.b64decode(image_data)
        
        # Load the image using PIL (Pillow)
        image = Image.open(BytesIO(image_bytes))
        
        # You can save the image for debugging if needed
        # image.save("debug_image.png")

        # Create a message with image content for the vision model
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "What is shown in this drawing? Give a simple but detailed description."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_data}"
                        }
                    }
                ]
            }
        ]

        # Send the image to DeepSeek via OpenRouter using the chat completions API
        response = client.chat.completions.create(
            model="deepseek/deepseek-vis-7b-chat:free",  # Make sure to use a vision model
            messages=messages,
            max_tokens=300
        )
        
        # Get the result
        result = response.choices[0].message.content

        return {"prediction": result}


    except Exception as e:
 # Print the full error for debugging
        import traceback
        print(f"Error processing image: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Run the server with: uvicorn server:app --host 0.0.0.0 --port 8000