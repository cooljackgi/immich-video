const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { getImageCaptionLocal } = require('./image-caption');
const { fetchAlbum, downloadAsset } = require('./immich-api');

async function generateTitleOnly(albumId) {
  const album = await fetchAlbum(albumId);
  const albumName = album.albumName || "Album";

  const imageAssets = album.assets.filter(asset => asset.type === "IMAGE");
  if (imageAssets.length === 0) {
    return [albumName];
  }

  const mediaFolder = path.join(__dirname, 'medien');
  if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder);
  }

  const downloadPromises = imageAssets.map((asset, idx) => {
    const ext = '.jpg';
    const fileName = path.join(mediaFolder, `temp_${String(idx + 1).padStart(3, '0')}${ext}`);
    return downloadAsset(asset, fileName).then(() => fileName);
  });
  const downloadedFiles = await Promise.all(downloadPromises);

  let captions = [];
  for (const file of downloadedFiles) {
    try {
      const caption = await getImageCaptionLocal(file);
      console.log(`Caption für ${file}:`, caption);
      captions.push(caption);
    } catch (error) {
      console.error(`Fehler beim Erstellen der Caption für ${file}: ${error.message}`);
    }
  }

  const combinedCaption = captions.join(', ');

  const prompt = `
Der bestehende Albumname ist "${albumName}".
Bitte erstelle nun kreative, kurze deutsche Albumnamen, 
die sowohl diesen Namen als Inspiration als auch folgende Bildbeschreibungen berücksichtigen:

Bildbeschreibungen:
${combinedCaption}
  `;

  console.log('🧠 LLM Prompt (lokal):', prompt);

  const ollamaEndpoint = process.env.OLLAMA_ENDPOINT;

  try {
    const response = await axios.post(
      ollamaEndpoint,
      {
        model: process.env.OLLAMA_MODEL,
        messages: [
          { role: 'system', content: 'Du bist ein kreativer Generator für deutsche Fotoalbumtitel.' },
          { role: 'user', content: prompt }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.message.content.trim();
    console.log('✅ Generierter Titel (Ollama):', content);
    return [content];
    
  } catch (error) {
    console.error('❌ Fehler bei Ollama-Request:', error.message);
    return [albumName + ' – ' + combinedCaption];
  }
  
}

module.exports = {
  generateTitleOnly
};
