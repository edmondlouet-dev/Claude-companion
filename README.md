# Arc Companion

A desktop AI companion with a laptop server and (later) a Raspberry Pi physical device.

## Structure

```
laptop-server/   ← REST API + background monitor (build this first)
pi-client/       ← Raspberry Pi device code (coming later)
```

---

## Laptop Server

### What it does

- Runs silently in the background on startup
- Captures a screenshot + detects active window every 10 seconds
- Flags distraction apps (YouTube, Netflix, Discord, Reddit…) during configured hours (default 5:30 pm – 9 pm, weekdays only)
- Exposes a local REST API on **port 8000** for the Pi (or any client) to call

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat` | Chat with Arc (optionally attaches a live screenshot) |
| `POST` | `/camera` | Send a camera image for Arc to describe |
| `POST` | `/screenshot` | Arc captures + describes the current screen |
| `GET`  | `/status` | Current focus state and active app |

#### `POST /chat`
```json
// request
{ "message": "what should i do next?", "include_screenshot": true }

// response
{ "response": "...", "action": null }
// action is non-null when Arc issues a CLAUDE_TASK: directive
```

#### `POST /camera`
```json
{ "image_base64": "<base64 jpeg>", "message": "who is this?" }
```

#### `POST /screenshot`
No body — takes a fresh screenshot and returns Arc's description.

#### `GET /status`
```json
{
  "active_app": "YouTube - Google Chrome",
  "is_focus": false,
  "is_distraction": true,
  "distraction_flagged": true
}
```

---

### Setup

**1. Install dependencies**

```bash
cd laptop-server
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

**2. Configure**

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Get a Gemini API key at https://aistudio.google.com/

**3. Run (manual)**

```bash
python main.py
```

Server starts at `http://0.0.0.0:8000`

**4. Run on startup**

*Windows* — double-click `startup/windows/install_startup.bat`.  
This copies `start_arc.vbs` to your Windows Startup folder. The server will launch silently (no console window) at every login. Logs go to `laptop-server/arc.log`.

*Mac* — edit the paths in `startup/mac/com.arc.companion.plist`, then:
```bash
cp startup/mac/com.arc.companion.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.arc.companion.plist
```

---

### Configuring focus / distraction hours

Edit `.env`:
```
DISTRACTION_BLOCK_START_H=17
DISTRACTION_BLOCK_START_M=30
DISTRACTION_BLOCK_END_H=21
DISTRACTION_BLOCK_END_M=0
```

To add or remove tracked apps, edit `laptop-server/config.py` — `FOCUS_APPS` and `DISTRACTION_APPS` lists.
