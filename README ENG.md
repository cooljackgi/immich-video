**Immich Video Editor**

The Immich Video Editor is a web application that automatically creates videos from media assets. Media is loaded directly from an Immich server and can be arranged in a user-friendly drag-and-drop timeline.

---

# ✨ Features

🖼️ **Automatic Media Import**  
Images and videos are loaded directly via the Immich API.

Supports Live-Photo videos and thumbnails as well.

---

# 🎮 Drag & Drop Timeline
- Media and transitions can be freely arranged and edited
- Live hover preview in the timeline
- Timeline displays transition markers and current position

---

# ⏱️ Duration Control
- Default image duration: 5 seconds
- Per-clip duration can be individually adjusted

---

# 🔀 Transitions
Transition effects like:
`fade`, `wipeleft`, `slideright`, `circleopen`, `circleclose`, `pixelize`

- Transition duration and overlap are fully configurable

---

# 🧐 Local AI-Powered Title Generation
AI-generated title suggestions (in German) using local models:

- `blip-caption:latest` for image captions
- `ollama mistral:7b-instruct` for creative titles

---

# ⚡ GPU-Accelerated Rendering
Videos are rendered using FFmpeg and `h264_nvenc` (NVIDIA GPU).

Includes transitions, music, and dynamic title clips.

---

# ⚙️ Flexible Configuration
Configure everything via `.env` file:
- API keys
- Host addresses
- Ports
- Model paths

---

# 🧪 Technology Stack
| Area         | Technology                      |
|--------------|----------------------------------|
| Backend      | Node.js, Express, FFmpeg        |
| Frontend     | HTML, CSS, JavaScript           |
| AI Models    | blip-caption, mistral:7b-instruct |
| Media Source | Immich API                      |

---

# 🧑‍🧜‍♂️ AI & Captioning
```env
OLLAMA_MODEL=mistral:7b-instruct
CAPTION_MODEL=blip-caption:latest
```

# 🌐 Immich API Example
```env
IMMICH_API_KEY=your-immich-api-key
IMMICH_API=http://192.168.x.x:2283/api
# or your hosted instance:
IMMICH_API=https://foto.xxx.com/api
```

# 📂 Other Settings
```env
PORT=3000
UPLOAD_PATH=./uploads
OUTPUT_PATH=./output
```

---

# 🧬 Ollama & BLIP Setup (local installation)
```bash
unzip ollama_blip_setup.zip
chmod +x setup-ai.sh
./setup-ai.sh
```
This script installs:
- 🧐 **Ollama** (for models like `mistral:7b-instruct`)
- 🖼️ **blip-caption** as a Docker API (for automatic image captions)

After setup:
- 📍 Ollama API: `http://localhost:11434`
- 📍 BLIP Caption API: `http://localhost:5000/caption`

---

# 🛠️ Planned / TODO
- [ ] Auto-generate music tracks using AI
- [ ] Timeline snapping & zoom
- [ ] Undo/Redo for timeline actions
- [ ] User session & album management
- [ ] Export progress indicator

---
