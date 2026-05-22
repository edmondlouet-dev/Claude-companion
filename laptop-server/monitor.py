import io
import base64
import platform
import subprocess
import threading
import time
from datetime import datetime
from typing import Optional

import mss
import mss.tools
import psutil
from PIL import Image

from config import (
    DISTRACTION_APPS,
    DISTRACTION_BLOCK_END,
    DISTRACTION_BLOCK_START,
    FOCUS_APPS,
)


def _get_active_window() -> str:
    """Return the active window title (cross-platform)."""
    system = platform.system()
    try:
        if system == "Windows":
            import ctypes

            hwnd = ctypes.windll.user32.GetForegroundWindow()
            # Try to get process name for better matching
            pid = ctypes.c_ulong()
            ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            try:
                proc_name = psutil.Process(pid.value).name().lower()
            except Exception:
                proc_name = ""
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
            title = buf.value
            return f"{proc_name} {title}".strip()

        elif system == "Darwin":
            result = subprocess.run(
                [
                    "osascript",
                    "-e",
                    'tell application "System Events" to get name of first application process whose frontmost is true',
                ],
                capture_output=True,
                text=True,
                timeout=3,
            )
            app_name = result.stdout.strip()
            # Also get window title via frontmost app
            title_result = subprocess.run(
                [
                    "osascript",
                    "-e",
                    f'tell application "{app_name}" to get name of front window',
                ],
                capture_output=True,
                text=True,
                timeout=3,
            )
            title = title_result.stdout.strip()
            return f"{app_name} {title}".strip()

        else:
            result = subprocess.run(
                ["xdotool", "getactivewindow", "getwindowname"],
                capture_output=True,
                text=True,
                timeout=3,
            )
            return result.stdout.strip()

    except Exception:
        return ""


def _capture_screenshot() -> Optional[str]:
    """Capture primary monitor, resize, and return as base64 JPEG."""
    try:
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            raw = sct.grab(monitor)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
            img.thumbnail((1280, 720), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=75)
            return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return None


def _in_distraction_window() -> bool:
    """True if current time falls within the configured block hours on a weekday."""
    now = datetime.now()
    if now.weekday() >= 5:
        return False
    sh, sm = DISTRACTION_BLOCK_START
    eh, em = DISTRACTION_BLOCK_END
    now_min = now.hour * 60 + now.minute
    return (sh * 60 + sm) <= now_min <= (eh * 60 + em)


def _classify(window_text: str) -> tuple[bool, bool]:
    """Return (is_focus, is_distraction) for the given window text."""
    lower = window_text.lower()
    is_focus = any(f in lower for f in FOCUS_APPS)
    is_distraction = any(d in lower for d in DISTRACTION_APPS)
    return is_focus, is_distraction


class FocusMonitor:
    def __init__(self):
        self._lock = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None

        self.active_app: str = ""
        self.is_focus: bool = False
        self.is_distraction: bool = False
        self.distraction_flagged: bool = False
        self._last_screenshot: Optional[str] = None

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _loop(self):
        while self._running:
            try:
                self._tick()
            except Exception:
                pass
            time.sleep(10)

    def _tick(self):
        window = _get_active_window()
        screenshot = _capture_screenshot()
        is_focus, is_distraction = _classify(window)
        flagged = is_distraction and _in_distraction_window()

        with self._lock:
            self.active_app = window
            self.is_focus = is_focus
            self.is_distraction = is_distraction
            self.distraction_flagged = flagged
            self._last_screenshot = screenshot

    def get_status(self) -> dict:
        with self._lock:
            return {
                "active_app": self.active_app,
                "is_focus": self.is_focus,
                "is_distraction": self.is_distraction,
                "distraction_flagged": self.distraction_flagged,
            }

    def latest_screenshot(self) -> Optional[str]:
        with self._lock:
            return self._last_screenshot

    def take_screenshot(self) -> Optional[str]:
        """Capture a fresh screenshot on demand (bypasses cache)."""
        return _capture_screenshot()
