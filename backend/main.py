import os
import time
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from groq import Groq

# Load API keys from .env
load_dotenv(override=True)
api_key = os.getenv('GROQ_API_KEY')

client = Groq(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# System prompt for AI
job_description_prompt = """
You are an AI assistant that extracts job descriptions from web pages and formats them professionally in JSON format.

Organize the output as:
{
    "job_title": "...",
    "responsibilities": ["...", "..."],
    "requirements": ["...", "..."],
    "preferred_qualifications": ["...", "..."],
    "benefits": ["...", "..."],
    "how_to_apply": "URL_HERE"
}

Use structured bullet points. Do not include irrelevant text.
"""

# Function to fetch job description using Selenium
def get_job_page_content(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Use remote Selenium server
    driver = webdriver.Remote(
        command_executor="http://selenium:4444/wd/hub",
        options=options
    )

    try:
        driver.get(url)
        time.sleep(5)
        job_content = driver.find_element(By.TAG_NAME, "body").text
    except Exception as e:
        print(f"Error: {e}")
        job_content = "Error: Could not load job description."
    finally:
        driver.quit()

    return job_content

# Function to generate structured job description
def generate_job_description(job_details, job_url, model):
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": job_description_prompt},
            {"role": "user", "content": f"{job_details}\n\nThe original job posting can be found here: {job_url}"}
        ],
        response_format={"type": "json_object"}  # Ensure JSON response
    )
    result = response.choices[0].message.content
    return json.loads(result)

# FastAPI Endpoint# Available LLM models
AVAILABLE_MODELS = ["gemma2-9b-it", "llama-3.3-70b-versatile", "llama3-70b-8192"]

@app.get("/api/scrape-job")
def scrape_job(
    url: str,
    model: str = Query(enum=AVAILABLE_MODELS)
):
    try:
        # Get job content from webpage
        job_details = get_job_page_content(url)

        # Process job description with AI
        job_data = generate_job_description(job_details, url, model)

        return {"status": "success", "data": job_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))