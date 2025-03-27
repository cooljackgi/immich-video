<div align="right">
<a href="#de">English</a> | <a href="#en">Deutsch</a> 
</div>

## English

# 🎮 Immich Video Editor
The Immich Video Editor is a web application for automatically creating videos from images, clips, and audio files – directly from your Immich server.
Media can be easily arranged in an intuitive drag-and-drop timeline.

![Demo GIF](./docs/demo.gif)
![Timeline Screenshot](./docs/timeline.png)

## ✨ Features

### 🖼️ Automatic Media Import
- Media is loaded directly via the Immich API
- Supports Live Photos (including video part), thumbnails, and videos

### 🎮 Drag & Drop Timeline
- Freely arrange and edit media and transitions
- Live hover preview in the timeline
- Timeline shows transition markers and current position

### ⏱️ Flexible Clip Duration
- Default image duration: 5 seconds
- Duration can be individually adjusted per clip
- Live Photos automatically use their video duration

### 🔀 Dynamic Transition Effects
- Supported transitions: `fade`, `wipeleft`, `slideright`, `circleopen`, `circleclose`, `pixelize`
- Transition duration and timing are automatically calculated based on actual clip lengths
- No manual offset handling required

### 🎵 Preserve Original Audio
- Video and Live Photo audio is preserved
- Missing audio tracks are filled with silence

### 🧐 Local AI-Powered Title Generation
- `blip-caption:latest` for image captions
- `Ollama mistral:7b-instruct` for creative title ideas (in German)

### ⚡ GPU-Accelerated Rendering
- Final video rendered with FFmpeg + NVIDIA `h264_nvenc`
- Includes transitions, music, and dynamic title clips

### ☁️ Upload Back to Immich
- After export, the final video can be automatically uploaded to an album
- Album is selected via its album ID

### ⚙️ Centralized Configuration
- All settings are controlled via `.env` file
- API keys, host addresses, ports, model paths, etc.

## 🧪 Tech Stack
| Area         | Technology                            |
|--------------|----------------------------------------|
| Backend      | Node.js, Express, FFmpeg (fluent-ffmpeg) |
| Frontend     | HTML, CSS, JavaScript                  |
| AI Models    | `blip-caption:latest`, `ollama mistral:7b-instruct` |
| Media Source | Immich API                             |

## ⚙️ Sample .env Configuration
```
# AI & Captioning
OLLAMA_MODEL=mistral:7b-instruct
CAPTION_MODEL=blip-caption:latest

# Immich API
IMMICH_API_KEY=your-immich-api-key
IMMICH_API=http://192.168.x.x:2283/api
# or external address
# IMMICH_API=https://foto.domain.com/api

# Upload
UPLOAD_PATH=./uploads
OUTPUT_PATH=./output
PORT=3000
```

## 🧬 Ollama & BLIP Setup (Local Installation)
```
unzip ollama_blip_setup.zip
chmod +x setup-ai.sh
./setup-ai.sh
```
The setup installs:
- 🧐 Ollama (for local LLMs like `mistral:7b-instruct`)
- 🖼️ blip-caption (as a Docker API for image captions)

After setup available at:
- 📍 Ollama: http://localhost:11434
- 📍 BLIP-Caption: http://localhost:5000/caption

## 🛠️ Planned / TODO
- 🎵 Auto-generate music using AI
- 🔍 Timeline zoom and snapping
- ↩️ Undo/Redo timeline actions
- 👤 User session & album management
- 📊 Export progress indicator

## Deutsch

# 🎮 Immich Video Editor
Der Immich Video Editor ist eine Webanwendung zur automatischen Erstellung von Videos aus Bildern, Clips und Audiodateien – direkt aus deinem Immich-Server.
Die Medien lassen sich einfach in einer intuitiven Drag-&-Drop-Timeline arrangieren.

## ✨ Features

### 🖼️ Automatischer Medienimport
- Medien werden direkt über die Immich API geladen
- Unterstützung für Live-Fotos (inkl. Videoanteil), Thumbnails und Videos

### 🎮 Drag-&-Drop-Timeline
- Medien und Übergänge frei anordnen und bearbeiten
- Vorschau durch Live-Hover über der Timeline
- Zeitstrahl zeigt Transition-Marker und aktuelle Position

### ⏱️ Flexible Clip-Dauer
- Bilder erhalten automatisch eine Standarddauer von 5 Sekunden
- Dauer kann pro Clip individuell angepasst werden
- Live-Fotos erhalten automatisch ihre Video-Dauer

### 🔀 Dynamische Übergangseffekte
- Unterstützte Effekte: `fade`, `wipeleft`, `slideright`, `circleopen`, `circleclose`, `pixelize`
- Übergangsdauer und Startzeit werden automatisch basierend auf den echten Clip-Längen berechnet
- Keine manuelle Zeitsetzung erforderlich

### 🎵 Originalton bleibt erhalten
- Audio von Videos und Live-Fotos wird automatisch beibehalten
- Fehlende Audiospuren werden mit Stille ergänzt

### 🧐 Lokale KI-Titelgenerierung
- `blip-caption:latest` für automatische Bildunterschriften
- `Ollama mistral:7b-instruct` für kreative Titelideen (deutschsprachig)

### ⚡ GPU-unterstütztes Rendering
- Finales Video wird mit FFmpeg + NVIDIA `h264_nvenc` gerendert
- Übergänge, Musik und dynamische Titelclips werden integriert

### ☁️ Upload zurück zu Immich
- Nach dem Export kann das fertige Video automatisch in ein Album hochgeladen werden
- Album wird über die Album-ID ausgewählt

### ⚙️ Zentrale Konfiguration
- Einstellungen über `.env`-Datei steuerbar
- API-Keys, Host-Adressen, Ports, Modellpfade etc.

## 🧪 Technologie-Stack
| Bereich       | Technologie                              |
|---------------|-------------------------------------------|
| Backend       | Node.js, Express, FFmpeg (via fluent-ffmpeg) |
| Frontend      | HTML, CSS, JavaScript                    |
| KI-Modelle    | `blip-caption:latest`, `ollama mistral:7b-instruct` |
| Medienquelle  | Immich API                               |

## ⚙️ Beispielhafte .env-Konfiguration
```
# KI & Captioning
OLLAMA_MODEL=mistral:7b-instruct
CAPTION_MODEL=blip-caption:latest

# Immich API
IMMICH_API_KEY=your-immich-api-key
IMMICH_API=http://192.168.x.x:2283/api
# oder externe Adresse
# IMMICH_API=https://foto.domain.com/api

# Upload
UPLOAD_PATH=./uploads
OUTPUT_PATH=./output
PORT=3000
```

## 🧬 Ollama & BLIP Setup (lokale Installation)
```
unzip ollama_blip_setup.zip
chmod +x setup-ai.sh
./setup-ai.sh
```
Das Setup installiert:
- 🧐 Ollama (für lokale LLMs wie `mistral:7b-instruct`)
- 🖼️ blip-caption (als Docker-API für Bildunterschriften)

Nach dem Setup erreichbar unter:
- 📍 Ollama: http://localhost:11434
- 📍 BLIP-Caption: http://localhost:5000/caption

## 🛠️ Noch geplant / TODO
- 🎵 Automatische Musikgenerierung mit KI
- 🔍 Timeline-Zoom und Snap-Funktion
- ↩️ Undo/Redo für Timeline-Aktionen
- 👤 Benutzer-Session & Albumverwaltung
- 📊 Fortschrittsanzeige beim Export
