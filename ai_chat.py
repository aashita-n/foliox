import requests
from flask import Flask, request, jsonify
from transformers import pipeline

# Initialize the chatbot pipeline (using distilgpt2 as an example)
chatbot = pipeline("text-generation", model="distilgpt2", device=-1)

# Initialize Flask app
app = Flask(__name__)

@app.route("/ai-chat", methods=["POST"])
def ai_chat():
    user_input = request.json.get("question", "")

    # Portfolio-specific question
    if "portfolio" in user_input.lower():
        response = requests.get("http://localhost:5000/api/immune/analyze")

        if response.status_code == 200:
            immune_data = response.json()

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

            return jsonify({"response": ai_response[0]["generated_text"]})

    # General finance Q&A
    else:
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

        return jsonify({"response": ai_response[0]["generated_text"]})
