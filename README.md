# Decoder - AI Powered Code Debugger

Decoder is an AI-powered code debugging assistant that helps developers identify, understand, and fix programming errors using Large Language Models. Built with Flask and Groq AI, Decoder provides instant debugging assistance through a simple and intuitive web interface.

## Features

* AI-powered code debugging
* Error analysis and explanation
* Bug detection and suggestions
* Fast responses using Groq LLMs
* Clean and responsive user interface
* Easy integration with different programming workflows

## Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Flask
* Python

### AI

* Groq API
* Large Language Models (LLMs)

## Project Structure

```text
decoder/
├── backend/
│   └── app.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/AswinSilver/decoder.git
cd decoder
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

### Run the Application

```bash
python backend/app.py
```

## How It Works

1. User submits code or an error message.
2. Flask backend processes the request.
3. Groq AI analyzes the code.
4. The system generates debugging suggestions and explanations.
5. Results are displayed in the frontend.

## Future Enhancements

* Multi-language support
* Code optimization suggestions
* Chat-based debugging interface
* Error history tracking
* File upload support
* Code execution sandbox

## Author

**Aswin Raj**

GitHub: https://github.com/AswinSilver

## License

This project is licensed under the MIT License.
