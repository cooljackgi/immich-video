🇩🇪 Deutsch



# 🎮 Immich Video Editor

Der Immich Video Editor ist eine Webanwendung zur automatischen Erstellung von Videos aus Bildern, Clips und Audiodateien – direkt aus deinem Immich-Server.Die Medien lassen sich einfach in einer intuitiven Drag-&-Drop-Timeline arrangieren.

# ✨ Features

🖼️ Automatischer Medienimport

Medien werden direkt über die Immich API geladen.

Unterstützung für Live-Fotos, Thumbnails und Videos.

 🎮 Drag-&-Drop-Timeline

Medien und Übergänge frei anordnen und bearbeiten

Vorschau durch Live-Hover über der Timeline

Zeitstrahl zeigt Transition-Marker und aktuelle Position

⏱️ Flexible Clip-Dauer

Bilder erhalten automatisch 5 Sekunden Dauer

Dauer kann pro Clip individuell angepasst werden

🔀 Übergangseffekte

Unterstützte Effekte: fade, wipeleft, slideright, circleopen, circleclose, pixelize

Übergangsdauer und Overlap frei konfigurierbar

# 🧐 Lokale KI-Titelgenerierung

blip-caption:latest für automatische Bildunterschriften

Ollama mistral:7b-instruct für kreative Titelideen (deutschsprachig)

⚡ GPU-unterstütztes Rendering

Finales Video wird mit FFmpeg + NVIDIA h264_nvenc gerendert

Übergänge, Musik und dynamische Titelclips werden integriert

☁️ Upload zurück zu Immich

Nach dem Export kann das fertige Video automatisch in ein Album hochgeladen werden

Album wird über die Album-ID ausgewählt

# ⚙️ Zentrale Konfiguration

Einstellungen über .env-Datei steuerbar

API-Keys, Host-Adressen, Ports, Modellpfade etc.

# 🧪 Technologie-Stack

Bereich

Technologie

Backend

Node.js, Express, FFmpeg (via fluent-ffmpeg)

Frontend

HTML, CSS, JavaScript

KI-Modelle

blip-caption:latest, ollama mistral:7b-instruct

Medienquelle

Immich API

⚙️ Beispielhafte .env-Konfiguration

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

🧬 Ollama & BLIP Setup (lokale Installation)

unzip ollama_blip_setup.zip
chmod +x setup-ai.sh
./setup-ai.sh

Das Setup installiert:

🧐 Ollama (für lokale LLMs wie mistral:7b-instruct)

🖼️ blip-caption (als Docker-API für Bildunterschriften)

Nach dem Setup erreichbar unter:

📍 Ollama: http://localhost:11434

📍 BLIP-Caption: http://localhost:5000/caption

# 🛠️ Noch geplant / TODO
Musikspur automatisch generieren (KI)

Timeline-Snapping und Zoom

Undo/Redo für Timeline-Aktionen

Benutzer-Session & Albumverwaltung

Fortschrittsanzeige beim Export
**