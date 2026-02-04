import os
import requests
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Now you can access the OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Check if the API key is loaded
if not OPENAI_API_KEY:
    print("ERROR: OPENAI_API_KEY environment variable is not set!")
else:
    print("OPENAI_API_KEY is configured")

openai_available = False
client = None

try:
    if OPENAI_API_KEY:
        client = OpenAI(api_key=OPENAI_API_KEY)
        openai_available = True
        print("OpenAI client initialized successfully")
    else:
        print("ERROR: No API key provided - OPENAI_API_KEY environment variable is not set")
except Exception as e:
    print(f"Configuration Error: {e}")
    traceback.print_exc()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/ai-chat": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
def generate_openai_response(prompt):
    if not openai_available:
        raise Exception("OpenAI is not available")

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",  # or gpt-4o-mini
            input=prompt
        )
        return response.output_text
    except Exception as e:
        print("OpenAI API error:", e)
        traceback.print_exc()
        raise



@app.route("/ai-chat", methods=["GET", "POST", "OPTIONS"])
def ai_chat():
    # Handle OPTIONS preflight request
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response
    
    # Handle GET request - return a welcome message
    if request.method == "GET":
        return jsonify({
            "response": "Hi 👋 I'm your FolioX AI assistant. Ask me anything about your portfolio."
        })
    
    # Handle POST request
    data = request.get_json(silent=True) or {}
    user_input = data.get("question", "")

    print(f"Received question: {user_input}")

    # Check if OpenAI is available
    if not openai_available:
        return jsonify({
            "response": "Error: OpenAI API is not configured. Please set the OPENAI_API_KEY environment variable."
        }), 500

    # Portfolio-specific question
    if "portfolio" in user_input.lower():
        print("Portfolio question detected, calling immune analysis...")
        try:
            # Call the Flask backend (script.py) for immune analysis
            response = requests.post("http://localhost:5000/api/immune/analyze", json={}, timeout=10)
            print(f"Immune API response status: {response.status_code}")
            
            if response.status_code == 200:
                immune_data = response.json()
                print(f"Immune data received: {immune_data}")

                prompt = f"""
You are a financial risk analysis assistant.

Analyze the portfolio using the information below and explain it clearly.

### Portfolio Immune Analysis
- Systemic Risk: {immune_data['systemic_risk']}
- Diagnosis: {immune_data['diagnosis']}
- Weak Points: {', '.join(immune_data['weak_points'])}

### Explanation
Explain why the portfolio is vulnerable to stress and market shocks.

### Investor Insight
Explain what the investor should be cautious about.

IMPORTANT RULES:
- Write at least 5 complete sentences.
- Do not summarize in one line.
- Keep the explanation practical and investor-focused.
- Provide a clear, structured response.
- Do NOT include the prompt or question in your response.
"""

                ai_response = generate_openai_response(prompt)
                print("AI response generated successfully")
                return jsonify({"response": ai_response})
            else:
                return jsonify({"response": f"Error: Immune API returned status {response.status_code}"}), 500
                
        except requests.exceptions.RequestException as e:
            print(f"Error calling immune API: {e}")
            return jsonify({"response": "Error: Could not connect to immune analysis service. Make sure script.py is running on port 5000."}), 500
        except Exception as e:
            print(f"Error generating AI response: {e}")
            traceback.print_exc()
            return jsonify({"response": f"Error: {str(e)}"}), 500

    # General finance Q&A
    else:
        print("General finance question detected...")
        try:
            prompt = f"""
You are a finance assistant.

Answer the question below in a structured and informative manner.

### Explanation
Explain the concept clearly in at least 4-5 sentences.

### Key Points
- Important idea 1
- Important idea 2
- Important idea 3

### Practical Insight
Explain how this affects investors or portfolios.

IMPORTANT RULES:
- Minimum 4 to 5 sentences.
- Avoid one-line answers.
- Stay strictly within finance topics.
- Provide clear, well-structured response.
- Do NOT include the prompt or question in your response.
- Do NOT repeat questions or headers in your answer.

Question:
{user_input}
"""

            ai_response = generate_openai_response(prompt)
            print("AI response generated successfully")
            return jsonify({"response": ai_response})
        except Exception as e:
            print(f"Error generating AI response: {e}")
            traceback.print_exc()
            return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    # Run the Flask AI chat app on port 5001 (port 5000 is used by script.py)
    app.run(host="0.0.0.0", port=5001, debug=True)

