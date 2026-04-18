"""
CogniSol - Sarvam AI Speech-to-Text Route
Accepts audio file uploads, sends them to Sarvam AI for transcription,
and returns the translated English text.
"""

import os
import requests
from flask import Blueprint, request, jsonify

sarvam_bp = Blueprint("sarvam", __name__)

# Sarvam AI Configuration
SARVAM_API_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "sk_tkpk939b_LOJXZHwIFc3VTD97qPjPv3MY")


@sarvam_bp.route("/api/sarvam/transcribe", methods=["POST"])
def transcribe_audio():
    """
    Transcribe an uploaded audio file using Sarvam AI.
    
    Accepts multipart/form-data with:
        file: audio file (WAV, MP3, WebM, etc.)
        language_code: optional BCP-47 language code (default: 'unknown' for auto-detect)
    
    Returns:
        200: { transcript, language_code, language_probability }
        400: Missing file
        502: Sarvam AI error
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No audio file provided. Upload as 'file' field."}), 400

        audio_file = request.files["file"]

        if audio_file.filename == "":
            return jsonify({"error": "Empty filename. Please upload a valid audio file."}), 400

        language_code = request.form.get("language_code", "unknown")

        # Build the multipart request to Sarvam AI
        files = {
            "file": (audio_file.filename, audio_file.stream, audio_file.content_type or "audio/webm"),
        }
        data = {
            "model": "saaras:v3",
            "mode": "translate",  # Translate any Indic language to English
            "language_code": language_code,
        }
        headers = {
            "api-subscription-key": SARVAM_API_KEY,
        }

        print(f"[CogniSol] Sending audio to Sarvam AI ({audio_file.filename}, {audio_file.content_type})...")

        response = requests.post(
            SARVAM_API_URL,
            files=files,
            data=data,
            headers=headers,
            timeout=30,
        )

        if response.status_code == 200:
            result = response.json()
            transcript = result.get("transcript", "")
            lang = result.get("language_code", "unknown")
            prob = result.get("language_probability", 0)

            print(f"[CogniSol] Sarvam AI transcript received: lang={lang}, prob={prob:.2f}")

            return jsonify({
                "success": True,
                "transcript": transcript,
                "language_code": lang,
                "language_probability": prob,
            }), 200
        else:
            error_detail = response.text
            print(f"[CogniSol] Sarvam AI error {response.status_code}: {error_detail}")
            return jsonify({
                "error": f"Sarvam AI returned {response.status_code}",
                "detail": error_detail,
            }), 502

    except requests.Timeout:
        return jsonify({"error": "Sarvam AI request timed out. Try a shorter audio clip."}), 504
    except Exception as e:
        print(f"[CogniSol] Sarvam transcription error: {e}")
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500
