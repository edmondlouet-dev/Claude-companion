from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gemini import chat, vision
from monitor import FocusMonitor

monitor = FocusMonitor()


@asynccontextmanager
async def lifespan(app: FastAPI):
    monitor.start()
    yield
    monitor.stop()


app = FastAPI(title="Arc Companion Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request models ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    include_screenshot: bool = False


class CameraRequest(BaseModel):
    image_base64: str
    message: str = "What do you see?"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_action(text: str):
    """Return the task string if Gemini issued a CLAUDE_TASK directive."""
    prefix = "CLAUDE_TASK:"
    if text.strip().startswith(prefix):
        return text.strip()[len(prefix):].strip()
    return None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    screenshot = monitor.take_screenshot() if req.include_screenshot else None
    try:
        text = chat(req.message, screenshot)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"response": text, "action": _extract_action(text)}


@app.post("/camera")
async def camera_endpoint(req: CameraRequest):
    try:
        text = vision(req.image_base64, req.message)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"response": text}


@app.post("/screenshot")
async def screenshot_endpoint():
    screenshot = monitor.take_screenshot()
    if not screenshot:
        raise HTTPException(status_code=500, detail="Screenshot capture failed")
    try:
        text = vision(screenshot, "Describe what is on screen")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"response": text}


@app.get("/status")
async def status_endpoint():
    return monitor.get_status()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
