import base64
import io
from typing import Optional

import google.generativeai as genai
from PIL import Image

from config import GEMINI_API_KEY, GEMINI_MODEL, SYSTEM_PROMPT

genai.configure(api_key=GEMINI_API_KEY)


def _model() -> genai.GenerativeModel:
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )


def _b64_to_pil(b64: str) -> Image.Image:
    return Image.open(io.BytesIO(base64.b64decode(b64)))


def chat(message: str, screenshot_b64: Optional[str] = None) -> str:
    parts = []
    if screenshot_b64:
        parts.append(_b64_to_pil(screenshot_b64))
    parts.append(message)
    response = _model().generate_content(parts)
    return response.text


def vision(image_b64: str, message: str = "Describe what is on screen") -> str:
    parts = [_b64_to_pil(image_b64), message]
    response = _model().generate_content(parts)
    return response.text
