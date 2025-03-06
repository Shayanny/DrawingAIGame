from openai import OpenAI
import os
from dotenv import load_dotenv
from fastapi import FastAPI
import uvicorn

app = FastAPI()

# Load environment variables from .env file
load_dotenv()

# Get the token
api_token = os.getenv("OP_API_TOKEN")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key= api_token,
)

completion = client.chat.completions.create(
  extra_headers={
    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
  },
  model="deepseek/deepseek-r1-distill-llama-70b:free",
  messages=[
    {
      "role": "user",
      "content": "What is the meaning of cooking?"
    }
  ]
)

print(completion)
print(completion.choices[0].message.content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Run the server with: uvicorn server:app --host 0.0.0.0 --port 8000