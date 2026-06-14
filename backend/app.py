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
    body = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
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

        error_prompt = f"""You are a code analysis expert. Analyze the following {language} code and identify ALL errors (syntax errors, logic errors, runtime errors, security issues, bad practices).

Code:
{code}

Respond in this exact format:
ERRORS:
- List each error on a new line with a dash
If no errors found, write: ERRORS:
- No errors detected.

Only output the ERRORS section. No extra explanation."""

        fix_prompt = f"""You are a code repair expert. Fix ALL errors in the following {language} code.

Code:
{code}

Respond with ONLY the corrected code. No explanation, no markdown fences, no comments."""

        errors = call_gemini(error_prompt)
        fix = call_gemini(fix_prompt)

        return jsonify({
            "errors": errors,
            "suggested_fix": fix
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
