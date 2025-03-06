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
        image_data = request.image.split(",")[1]  # Remove the "data:image/png;base64," part
        image_bytes = base64.b64decode(image_data)
        
        # Load the image using PIL (Pillow)
        image = Image.open(BytesIO(image_bytes))

        # Generate a descriptive prompt based on the image (you can customize this logic)
        prompt = "Describe the contents of this image."

        # Send the prompt to OpenAI Deepseek model for analysis
        response = OpenAI.Completion.create(
            model="deepseek/deepseek-r1-distill-llama-70b:free",
            prompt=prompt,
            max_tokens=150  # Adjust the max tokens as needed
        )
        
        # Get the result from OpenAI
        result = response.choices[0].text.strip()

        return {"prediction": result}


    except Exception as e:
        raise HTTPException(status_code=400, detail="Error processing image: " + str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Run the server with: uvicorn server:app --host 0.0.0.0 --port 8000