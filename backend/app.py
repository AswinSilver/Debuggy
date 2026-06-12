from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("API KEY FOUND:", bool(GROQ_API_KEY))
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def call_groq(prompt):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama-3.3-70b-versatile",
        "max_tokens": 2048,
        "messages": [{"role": "user", "content": prompt}]
    }
    response = requests.post(GROQ_URL, headers=headers, json=body)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()

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
If no errors found, write: ERRORS:\n- No errors detected.

Only output the ERRORS section. No extra explanation."""

        fix_prompt = f"""You are a code repair expert. Fix ALL errors in the following {language} code.

Code:
{code}

Respond with ONLY the corrected code. No explanation, no markdown fences, no comments."""

        errors = call_groq(error_prompt)
        fix = call_groq(fix_prompt)

        return jsonify({
            "errors": errors,
            "suggested_fix": fix
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)