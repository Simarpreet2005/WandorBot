from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import google.generativeai as genai

app = Flask(__name__)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

SYSTEM_PROMPT = """
You are an Airbnb chatbot specializing in finding unique stays like treehouses, cabins, and yurts. 
Your primary goal is to provide a specific, concise, and friendly accommodation suggestion that matches the user's requested type of stay (e.g., treehouse), location, budget, and number of guests as closely as possible. 
Always include a brief description, estimated price range, and key amenities (e.g., Wi-Fi, kitchen) in your response. 
If the exact request (e.g., treehouse under $200) is challenging, suggest the closest matching option within or slightly above the budget, clearly explaining any deviation while staying focused on the requested type (e.g., treehouse, not cabin). 
Only suggest alternatives (e.g., cabins) if the user explicitly agrees or if no treehouses exist in the area. 
Use all provided details without asking for clarification unless critical information (e.g., location) is completely missing. 
Example response for 'treehouse in Colorado under $200, 5 guests': 'Near Estes Park, Colorado, you can stay in a cozy treehouse for $180-$200 per night, sleeping 5 guests. It has Wi-Fi, a small deck with mountain views, and hiking nearby. Want more details?'
"""

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        full_prompt = f"{SYSTEM_PROMPT}\nUser request: {user_message}"
        response = model.generate_content(full_prompt)
        bot_response = response.text
        
        return jsonify({"response": bot_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)