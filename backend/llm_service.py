import urllib.request
import json
import traceback
import re
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_TAGS_URL = "http://localhost:11434/api/tags"

SYSTEM_PROMPT = """You are an expert Python programming tutor helping a beginner. 
The student has submitted code that produced an error. 
Analyze the code and the error to determine their core conceptual misconception.

You must respond with ONLY a JSON object in exactly this format:
{
  "misconception": "Explain the underlying conceptual mistake in one short sentence.",
  "explanation": "Provide a clear, simple explanation of why the code is wrong.",
  "fix": "Tell the student exactly how to fix the code.",
  "practice": "Suggest a small practice task to reinforce this concept."
}
Return ONLY valid JSON data. No markdown formatting or extra text."""

def get_available_model() -> str:
    """Explicitly use llama3.1 per instruction."""
    return "llama3.1"

def analyze_error(code: str, error_type: str, error_message: str) -> dict:
    model = get_available_model()
    prompt = f"Code:\\n{code}\\n\\nError Type: {error_type}\\nError Message: {error_message}"
    
    data = {
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\\n\\n{prompt}",
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
            "num_predict": 1024
        }
    }
    
    try:
        req = urllib.request.Request(OLLAMA_API_URL, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            response_text = result.get('response', '{}').strip()
            
            # Remove potential markdown json blocks if the model ignored instructions
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                print(f"JSON decode failed. Raw text: {response_text}")
                # Clean up the broken JSON so it's readable for the user
                cleaned = re.sub(r'["\\{\\}]', '', response_text)
                cleaned = re.sub(r'\\b(misconception|explanation|fix|practice):', r'\\n\\1:', cleaned, flags=re.IGNORECASE).strip()
                
                return {
                    "misconception": "LLM Analysis formatting failed.",
                    "explanation": cleaned,
                    "fix": "Please review the code carefully.",
                    "practice": "Write smaller blocks of code to isolate the issue."
                }
    except Exception as e:
        print(f"LLM API Error: {e}")
        return None

def generate_practice(code: str, error_message: str) -> str:
    model = get_available_model()
    prompt = f"The student recently had this error:\\nError: {error_message}\\nCode:\\n{code}\\n\\nGenerate one specific, actionable coding practice task to help them overcome this misconception. Return ONLY the text of the practice task (no JSON, no intro text, no markdown block)."
    
    data = {
        "model": model, 
        "prompt": prompt, 
        "stream": False, 
        "options": {
            "temperature": 0.5,
            "num_predict": 1024
        }
    }
    
    try:
        req = urllib.request.Request(OLLAMA_API_URL, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('response', 'Try reviewing basic Python syntax.').strip()
    except Exception:
        return "Write a basic Python program to practice syntax."
