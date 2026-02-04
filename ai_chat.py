import requests
from flask import Flask, request, jsonify
from transformers import pipeline

# Initialize the chatbot pipeline (using distilgpt2 as an example)
chatbot = pipeline("text-generation", model="distilgpt2", device=-1)

# Initialize Flask app
app = Flask(__name__)

# Define the /ai-chat endpoint to handle chatbot requests
@app.route("/ai-chat", methods=["POST"])
def ai_chat():
    user_input = request.json.get("question", "")

    # Check if the user asked about the portfolio immune analysis
    if "portfolio" in user_input.lower():
        # Get portfolio immune analysis data from the backend
        response = requests.get("http://localhost:5000/api/immune/analyze")
        if response.status_code == 200:
            immune_data = response.json()

            # Generate a structured prompt for the chatbot based on immune data
            prompt = f"""
            Based on the following portfolio analysis, explain it to the user:

            Immune Profile: {immune_data['systemic_risk']}
            Diagnosis: {immune_data['diagnosis']}
            Weak Points: {', '.join(immune_data['weak_points'])}

            Provide a detailed explanation about why this portfolio is vulnerable to stress.
            """

            # Generate AI response
            ai_response = chatbot(prompt, max_length=100, temperature=0.7)
            return jsonify({"response": ai_response[0]['generated_text']})

    # Handle general finance questions (using a generic prompt)
    else:
        prompt = f"Answer the following finance question clearly and concisely: {user_input}"

        # Generate AI response for general finance questions
        ai_response = chatbot(prompt, max_length=100, temperature=0.7)
        return jsonify({"response": ai_response[0]['generated_text']})


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
