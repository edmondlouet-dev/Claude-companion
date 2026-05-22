import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-1.5-flash"

FOCUS_APPS = [
    "notion",
    "microsoft word",
    "winword",
    "google docs",
    "docs.google",
    "vs code",
    "vscode",
    "visual studio code",
    "code.exe",
]

DISTRACTION_APPS = [
    "youtube",
    "netflix",
    "discord",
    "reddit",
    "instagram",
    "twitch",
    "tiktok",
    "facebook",
    "twitter",
    "x.com",
]

# 24-hour clock (hour, minute)
DISTRACTION_BLOCK_START = (
    int(os.getenv("DISTRACTION_BLOCK_START_H", "17")),
    int(os.getenv("DISTRACTION_BLOCK_START_M", "30")),
)
DISTRACTION_BLOCK_END = (
    int(os.getenv("DISTRACTION_BLOCK_END_H", "21")),
    int(os.getenv("DISTRACTION_BLOCK_END_M", "0")),
)

SYSTEM_PROMPT = (
    "You are a desktop AI companion called Arc. You are concise, direct, and slightly dry in personality. "
    "You help the user stay focused, answer questions, read their screen or camera when asked, and assist with tasks. "
    "If the user asks you to organise files, write code, rename folders, create documents, or perform any action "
    "on their computer, respond ONLY with: CLAUDE_TASK: followed by the full instruction. "
    "Do not attempt computer actions yourself. "
    "Keep all responses short unless the user explicitly asks for detail."
)
