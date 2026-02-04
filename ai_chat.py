import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

# Initialize the chatbot pipeline (using distilgpt2 as an example)
chatbot = pipeline("text-generation", model="distilgpt2", device=-1)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/ai-chat": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

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
    user_input = request.json.get("question", "")
    print(f"Received question: {user_input}")

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
"""

                ai_response = chatbot(
                    prompt,
                    max_length=180,
                    temperature=0.7,
                    top_p=0.9,
                    do_sample=True
                )
                print("AI response generated successfully")
                return jsonify({"response": ai_response[0]["generated_text"]})
            else:
                return jsonify({"response": f"Error: Immune API returned status {response.status_code}"}), 500
                
        except requests.exceptions.RequestException as e:
            print(f"Error calling immune API: {e}")
            return jsonify({"response": "Error: Could not connect to immune analysis service. Make sure script.py is running on port 5000."}), 500
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return jsonify({"response": f"Error: {str(e)}"}), 500

    # General finance Q&A
    else:
        print("General finance question detected...")
        try:
            prompt = f"""
You are a finance assistant.

Answer the question below in a structured and informative manner.

### Explanation
Explain the concept clearly.

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

Question:
{user_input}
"""

            ai_response = chatbot(
                prompt,
                max_length=180,
                temperature=0.7,
                top_p=0.9,
                do_sample=True
            )
            print("AI response generated successfully")
            return jsonify({"response": ai_response[0]["generated_text"]})
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    # Run the Flask AI chat app on port 5001 (port 5000 is used by script.py)
    app.run(host="0.0.0.0", port=5001, debug=True)

