from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def call_gemini(prompt):
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(url, json=body)
    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

@app.route("/")
def home():
    return "Debuggy is running!"

@app.route("/debug", methods=["POST"])
def debug_code():
    try:
        data = request.json
        code = data.get("code", "").strip()
        language = data.get("language", "Python").strip()

        if not code:
            return jsonify({"error": "No code provided."}), 400

        prompt = f"""You are a code analysis and repair expert. Analyze this {language} code.

Code:
{code}

Reply in EXACTLY this format, nothing else:

ERRORS:
- each error on its own line with a dash
- if no errors write: No errors detected.

FIX:
only the corrected code here, no markdown fences, no comments"""

        result = call_gemini(prompt)

        errors = ""
        fix = ""
        if "FIX:" in result:
            parts = result.split("FIX:", 1)
            errors = parts[0].replace("ERRORS:", "").strip()
            fix = parts[1].strip()
        else:
            errors = result
            fix = "Could not generate fix."

        return jsonify({"errors": errors, "suggested_fix": fix})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)