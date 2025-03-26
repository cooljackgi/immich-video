**Immich Video Editor
Immich Video Editor ist eine Webanwendung, mit der automatisch Videos aus Medien-Assets erstellt werden können. Medien werden direkt vom Immich-Server geladen und lassen sich in einer benutzerfreundlichen Drag-&-Drop-Timeline arrangieren.

# ✨ Features
🖼️ Automatischer Medienimport
Bilder und Videos werden direkt über die Immich API geladen.

Unterstützt auch Live-Photo-Videos und Thumbnails.

# 🎞️ Drag‑&‑Drop-Timeline
Medien und Übergänge können frei angeordnet und bearbeitet werden.

Vorschau durch Live-Hover über der Timeline.

Zeitstrahl zeigt Transition-Marker und aktuelle Position.

⏱️ Daueranpassung
Bilder haben standardmäßig 5 Sekunden Dauer.

Dauer kann pro Clip individuell verändert werden.

🔁 Übergänge
Übergangseffekte wie fade, wipeleft, slideright, circleopen, circleclose, pixelize.

Übergangsdauer und Overlap frei konfigurierbar.

🧠 Lokale KI-Titelgenerierung
KI-generierte Titelvorschläge auf Deutsch über lokale Modelle:

blip-caption:latest für Bildunterschriften

Ollama mistral:7b-instruct für kreative Titelideen

⚡ GPU-unterstütztes Rendering
Videos werden mit FFmpeg und h264_nvenc (NVIDIA GPU) gerendert.

Übergänge, Musik und dynamische Titelclips integriert.

⚙️ Flexible Konfiguration
Einstellungen über .env-Datei steuerbar

API-Keys, Host-Adressen, Ports, Modellpfade etc. zentral konfigurierbar

🧪 Technologie-Stack
Bereich	Technologie
Backend	Node.js, Express, FFmpeg (fluent-ffmpeg)
Frontend	HTML, CSS, JavaScript
KI-Modelle	[blip-caption:latest], [Ollama mistral:7b-instruct]
Medienquelle	Immich API



# KI & Captioning
OLLAMA_MODEL=mistral:7b-instruct
CAPTION_MODEL=blip-caption:latest

# Immich API
IMMICH_API_KEY=your-immich-api-key
IMMICH_API=http://192.168.x.x:2283/api
oder die echt Adresse
IMMICH_API=https://foto.xxx.com/api

# Sonstiges
PORT=3000
UPLOAD_PATH=./uploads
OUTPUT_PATH=./output



🧠 Ollama & BLIP-Setup (lokale Installation)
bash
Kopieren
Bearbeiten
unzip ollama_blip_setup.zip
chmod +x setup-ai.sh
./setup-ai.sh
Das Skript installiert:

🧠 Ollama (für LLMs wie mistral:7b-instruct)

🖼️ blip-caption als Docker-API (für automatische Bildunterschriften)

Nach dem Setup:

📍 Ollama API: http://localhost:11434

📍 BLIP-Caption API: http://localhost:5000/caption


🛠️ Noch geplant / TODO
Musikspur automatisch generieren (KI)

Timeline-Snapping und Zoom

Undo/Redo für Timeline-Aktionen

Benutzer-Session & Albumverwaltung

Fortschrittsanzeige beim Export
**