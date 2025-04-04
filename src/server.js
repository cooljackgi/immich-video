const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');
const { generateVideo } = require('./processing/main-process');
const { generateTitleOnly } = require('./processing/titel-generator');
const { createIntroClip } = require('./processing/intro');
const { generateFinalVideo } = require('./processing/final-video');
const { uploadAssetFile, addAssetsToAlbum } = require('./processing/immich-api');
const { downloadLivePhotoVideo } = require('./processing/immich-api');
const { generateThumbnail } = require('./processing/video-thumbnail');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ordnerstruktur
const mediaFolder = path.join('medien');
if (!fs.existsSync(mediaFolder)) {
  fs.mkdirSync(mediaFolder, { recursive: true });
  console.log('"medien/" wurde erstellt.');
}

const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
  console.log(`Temp-Ordner wurde erstellt: ${tempFolder}`);
}

const processingMediaFolder = path.join(__dirname, 'processing', 'medien');
if (!fs.existsSync(processingMediaFolder)) {
  fs.mkdirSync(processingMediaFolder, { recursive: true });
  console.log('"processing/medien/" wurde erstellt.');
}

// Statische Pfade
const mediaPath = path.join(__dirname, '../medien');
app.use('/media', express.static(mediaPath));
console.log("Media path:", mediaPath);

const outputPath = path.join(__dirname, '..');
app.use('/output', express.static(outputPath));
console.log("Output path:", outputPath);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// API-Endpunkte
app.get('/api/albums', async (req, res) => {
  try {
    const { fetchAlbums } = require('./processing/immich-api');
    const albums = await fetchAlbums();
    console.log("GET /api/albums - Antwort:", albums);
    res.json(albums);
  } catch (error) {
    console.error("GET /api/albums - Fehler:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/videoThumbnail', async (req, res) => {
  const { videoName } = req.query;

  if (!videoName) {
    return res.status(400).json({ error: 'Kein videoName angegeben' });
  }

  try {
    const videoPath = path.join(__dirname, '../medien', videoName);
    const thumbnailPath = path.join(__dirname, '../medien/thumbnails');

    // Sicherstellen, dass das Thumbnail-Verzeichnis existiert
    fs.mkdirSync(thumbnailPath, { recursive: true });

    const thumbPath = await generateThumbnail(videoPath, thumbnailPath);

    if (!fs.existsSync(thumbPath)) {
      return res.status(404).json({ error: 'Thumbnail konnte nicht erstellt werden' });
    }

    res.sendFile(thumbPath);
  } catch (error) {
    console.error("Fehler beim Abrufen des Thumbnails:", error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/generateTitle', async (req, res) => {
  try {
    const ALBUM_ID = req.query.albumId;
    const generatedTitles = await generateTitleOnly(ALBUM_ID);
    console.log("GET /api/generateTitle - Antwort:", generatedTitles);
    res.json({ finalTitles: generatedTitles });
  } catch (error) {
    console.error("GET /api/generateTitle - Fehler:", error);
    res.status(500).json({ error: error.message });
  }
});


const { execSync } = require('child_process');

function getDurationInMs(filePath) {
  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    return Math.round(parseFloat(output.toString().trim()) * 1000);
  } catch (err) {
    console.warn(`⚠️ Konnte Dauer für ${filePath} nicht ermitteln. Fallback auf 3000ms.`);
    return 3000;
  }
}

app.get('/api/album', async (req, res) => {
  try {
    const albumId = req.query.albumId;
    if (!albumId) {
      console.error("GET /api/album - Fehler: Album-ID fehlt");
      return res.status(400).send("Album-ID wird benötigt");
    }
    const { fetchAlbum, downloadAsset } = require('./processing/immich-api');
    const album = await fetchAlbum(albumId);
    console.log(`GET /api/album - Album geladen: ${album.albumName}`);

    const mediaFolder = path.join(__dirname, '../medien');
    await Promise.all(album.assets.map(async (asset, idx) => {
      const ext = asset.type === 'VIDEO' ? '.mp4' : '.jpg';
      const fileName = path.join(mediaFolder, asset.originalFileName);
      console.log("GET /api/album - Lade herunter:", fileName);
      await downloadAsset(asset, fileName);
      asset.downloadName = asset.originalFileName;



      if (asset.livePhotoVideoId) {
        const liveVideoFileName = `${asset.livePhotoVideoId}.mp4`;
        const liveVideoPath = path.join(mediaFolder, liveVideoFileName);

        if (!fs.existsSync(liveVideoPath)) {
          console.log(`Lade Live-Video ${asset.livePhotoVideoId} für Asset ${asset.id}`);
          await downloadLivePhotoVideo(asset.livePhotoVideoId, liveVideoPath);
        }

        // 🧠 Dauer aus dem echten Video auslesen
        const realDuration = getDurationInMs(liveVideoPath);

        const liveAsset = {
          type: 'VIDEO',
          downloadName: liveVideoFileName,
          originalFileName: liveVideoFileName,
          duration: realDuration,
          isLivePhoto: true,
          sourceImageId: asset.id
        };

        album.assets.push(liveAsset);
      }



    }));

    console.log("GET /api/album - Antwort (Assets):", album.assets);
    res.json(album.assets);
  } catch (error) {
    console.error("GET /api/album - Fehler:", error);
    res.status(500).send(error.message);
  }
});

const envPath = path.join(__dirname, '../.env');

// GET: .env laden und als JSON senden
app.get('/api/env', (req, res) => {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  res.json(envConfig);
});

// POST: .env speichern (überschreibt die Datei)
app.post('/api/env', (req, res) => {
  const newEnv = req.body;
  const envString = Object.entries(newEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, envString);
  res.json({ success: true });
});


app.post('/api/intro', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      console.error("POST /api/intro - Fehler: Kein Titel angegeben");
      return res.status(400).json({ error: 'Kein Titel angegeben' });
    }

    const outputFile = path.join(__dirname, '../medien', 'intro.mp4');
    await createIntroClip(title, outputFile);
    console.log("POST /api/intro - Intro-Clip erstellt:", outputFile);
    res.json({ success: true, file: outputFile });
  } catch (error) {
    console.error("POST /api/intro - Fehler:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/export', async (req, res) => {
  console.log("POST /api/export - Request Body:", req.body);
  try {
    // Die exportData wird jetzt direkt aus req.body gelesen
    const exportData = {
      title: req.body.title,
      media: req.body.media,
      resolution: req.body.resolution // Auflösung hinzufügen
    };

    // Hier den gewünschten Outputnamen generieren
    let outputFileName = exportData.title ? exportData.title : 'final-video';
    outputFileName = outputFileName.replace(/[^a-zA-Z0-9]+/g, '_');
    outputFileName = `${outputFileName}.mp4`;
    const outputPath = path.join(__dirname, '../public/output', outputFileName);

    // Übergabe von exportData statt req.body
    // Wir übergeben jetzt exportData und outputPath
    const outputFile = await generateFinalVideo(exportData, outputPath, sendProgressUpdate);
    console.log("POST /api/export - Finales Video erstellt:", outputFile);
    res.json({ success: true, file: outputFile });
  } catch (error) {
    console.error("POST /api/export - Fehler:", error);
    res.status(500).send(error.message);
  }
});


app.get('/api/livePhotoVideo', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Kein videoId angegeben' });
  }

  const liveVideoPath = path.join(__dirname, 'media/live', `${videoId}.mp4`);

  // Prüfe, ob das Video bereits existiert
  if (!fs.existsSync(liveVideoPath)) {
    console.log(`Live-Video ${videoId} nicht gefunden, lade es herunter...`);
    try {
      await downloadLivePhotoVideo(videoId, liveVideoPath);
    } catch (error) {
      return res.status(500).json({ error: 'Fehler beim Laden des Live-Photo-Videos' });
    }
  }

  // Sende das gespeicherte Live-Video an den Client
  res.sendFile(liveVideoPath);
});

// Neuer API-Endpunkt zum Upload des finalen Videos und Hinzufügen zu einem Album
// server.js
app.post('/api/uploadFinal', async (req, res) => {
  try {
    const { albumId, title } = req.body; // Wir erwarten nun 'title'
    if (!albumId) {
      console.error("POST /api/uploadFinal - Fehler: Album-ID fehlt im Request Body");
      return res.status(400).json({ error: 'Album-ID fehlt' });
    }
    console.log(`POST /api/uploadFinal - Starte Upload des finalen Videos für Album ${albumId}`);

    // Generiere den Dateinamen wie im Export-Endpoint
    let fileName = title && title.trim() ? title : 'final-video';
    fileName = fileName.replace(/[^a-zA-Z0-9]+/g, '_') + '.mp4';
    const finalVideoPath = path.join(__dirname, '../public/output', fileName);

    if (!fs.existsSync(finalVideoPath)) {
      console.error("POST /api/uploadFinal - Fehler: Finales Video nicht gefunden unter:", finalVideoPath);
      return res.status(400).json({ error: 'Finales Video nicht gefunden' });
    }

    // 1. Upload des finalen Videos an Immich
    const form = new FormData();
    // Verwende 'assetData' anstelle von 'file'
    form.append('assetData', fs.createReadStream(finalVideoPath));
    // Füge die anderen erforderlichen Felder hinzu (wie im Doku-Beispiel)
    form.append('deviceAssetId', 'test-device-asset-id'); // Ersetze durch einen sinnvollen Wert
    form.append('deviceId', 'test-device-id'); // Ersetze durch einen sinnvollen Wert
    form.append('fileCreatedAt', new Date().toISOString());
    form.append('fileModifiedAt', new Date().toISOString());

    console.log("POST /api/uploadFinal - Sende Upload-Anfrage an Immich für:", finalVideoPath);

    try {
      // ACHTUNG: Verwende hier /assets statt /assets/upload
      const uploadResponse = await axios.post(`${process.env.IMMICH_API}/assets`, form, {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.IMMICH_API_KEY,
          'Content-Type': 'multipart/form-data', // explizit setzen
          'Accept': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log("POST /api/uploadFinal - Upload-Antwort von Immich:", uploadResponse.data);

      const assetId = uploadResponse.data.id;
      if (!assetId) {
        throw new Error('Kein Asset-ID vom Upload erhalten');
      }
      console.log("POST /api/uploadFinal - Erhaltene Asset-ID:", assetId);

      // 2. Füge das hochgeladene Asset dem Album hinzu
      const putData = { ids: [assetId] };
      console.log("POST /api/uploadFinal - Sende PUT-Anfrage zum Hinzufügen des Assets zum Album:", albumId);

      try {
        const putResponse = await axios.put(
          `${process.env.IMMICH_API}/albums/${albumId}/assets`,
          putData,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.IMMICH_API_KEY
            }
          }
        );
        console.log("POST /api/uploadFinal - Antwort des Hinzufügens zum Album:", putResponse.data);
        res.json({ success: true, result: putResponse.data });

      } catch (putError) {
        console.error("POST /api/uploadFinal - Fehler beim Hinzufügen zum Album:", putError.message);
        if (putError.response) {
          console.error("POST /api/uploadFinal - Status:", putError.response.status);
          console.error("POST /api/uploadFinal - Daten:", putError.response.data);
        }
        return res.status(500).json({ error: putError.message });
      }

    } catch (uploadError) {
      console.error("POST /api/uploadFinal - Fehler beim Upload:", uploadError.message);
      if (uploadError.response) {
        console.error("POST /api/uploadFinal - Status:", uploadError.response.status);
        console.error("POST /api/uploadFinal - Daten:", uploadError.response.data);
        console.error("POST /api/uploadFinal - Headers:", uploadError.response.headers); // Logge die Request-Headers
      }
      return res.status(500).json({ error: uploadError.message });
    }

  } catch (error) {
    console.error('POST /api/uploadFinal - Unerwarteter Fehler:', error);
    res.status(500).json({ error: error.message });
  }
});

const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/proxy/ollama', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy/ollama': '/api', // 👈 ersetzt "proxy/ollama" durch "api"
  },
}));




const clients = []; // global am Anfang der Datei (z. B. direkt nach `const app = express()` definieren)

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write('retry: 10000\n\n'); // Wiederverbindungsintervall für SSE

  clients.push(res);
  console.log("📡 Neuer SSE-Client verbunden. Gesamt:", clients.length);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
    console.log("❌ SSE-Client getrennt. Gesamt:", clients.length);
  });
});


function sendProgressUpdate(message) {
  clients.forEach(client => {
    client.write(`data: ${message}\n\n`);
  });
}


// Fortschritt-Sender global speichern
let currentExportClients = [];

app.get('/api/export-progress', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  // Direkt einmal "verbunden" senden
  res.write(`data: ⏳ Export gestartet...\n\n`);

  currentExportClients.push(res);

  // Bei Disconnect entfernen
  req.on('close', () => {
    currentExportClients = currentExportClients.filter(c => c !== res);
  });
});





app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf http://127.0.0.1:${port}`);
});