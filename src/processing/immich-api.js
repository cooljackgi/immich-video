// immich-api.js
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

const IMMICH_API = process.env.IMMICH_API;  // z.B. "http://192.168.3.108:2283/api"
const API_KEY = process.env.IMMICH_API_KEY;  // Dein API-Key

console.log("IMMICH_API:", IMMICH_API);
console.log("IMMICH_API:", API_KEY);



module.exports = {
    // Abrufen eines Albums anhand der übergebenen Album-ID
    fetchAlbum: async (albumId) => {
        if (!albumId) {
            throw new Error("Album-ID fehlt");
        }
        try {
            const response = await axios.get(`${IMMICH_API}/albums/${albumId}`, {
                headers: { 'x-api-key': API_KEY }
            });
            console.log("Album erfolgreich abgerufen:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fehler beim Abrufen des Albums:", error.message);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Daten:", error.response.data);
            }
            throw error;
        }
    },

    


    downloadLivePhotoVideo: async (videoId, savePath) => {
      console.log(`Lade Live-Video herunter: ${videoId}`);
      
      try {
          const response = await axios.get(`${IMMICH_API}/assets/${videoId}/original`, {
              headers: { 'x-api-key': API_KEY },
              responseType: 'stream'
          });
  
          const writer = fs.createWriteStream(savePath);
          response.data.pipe(writer);
  
          await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
          });
  
          console.log(`Live-Photo-Video gespeichert: ${savePath}`);
          return savePath;
      } catch (error) {
          console.error(`Fehler beim Herunterladen des Live-Photo-Videos ${videoId}:`, error.message);
          if (error.response) {
              console.error("Status:", error.response.status);
              console.error("Daten:", error.response.data);
          }
          throw error;
      }
  },

    // Funktion, um alle Alben abzurufen (wenn die API dies unterstützt)
    fetchAlbums: async () => {
        try {
            const response = await axios.get(`${IMMICH_API}/albums`, {
                headers: { 'x-api-key': API_KEY }
            });
            console.log("Alben erfolgreich abgerufen:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fehler beim Abrufen der Alben:", error.message);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Daten:", error.response.data);
            }
            throw error;
        }
    },

    downloadAsset: async (asset, filename) => {
        if (fs.existsSync(filename)) {
            console.log(`Asset bereits vorhanden: ${filename}`);
            return; // nichts machen, Datei ist schon da
        }
    
        console.log("Speichere Asset in:", filename);
        try {
            const writer = fs.createWriteStream(filename);
            const response = await axios.get(`${IMMICH_API}/assets/${asset.id}/original`, {
                headers: { 'x-api-key': API_KEY },
                responseType: 'stream'
            });
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            console.error("Fehler beim Herunterladen des Assets:", error.message);
            throw error;
        }
    },

    // Upload-Funktion, angepasst an die API-Dokumentation:
    uploadAssetFile: async (filePath) => {
        const form = new FormData();
        // Datei anhängen – als assetData
        form.append('assetData', fs.createReadStream(filePath));
        // Zusätzliche Felder – hier kannst du Testwerte verwenden oder später dynamisch füllen:
        form.append('deviceAssetId', '12345678-90ab-cdef-1234-567890abcdef');
        form.append('deviceId', 'device-1234');
        form.append('fileCreatedAt', new Date().toISOString());
        form.append('fileModifiedAt', new Date().toISOString());

        console.log("Lade Datei hoch:", filePath);
        try {
            console.log("FormData-Objekt:", form); // Logge das FormData-Objekt

            const response = await axios.post(`${IMMICH_API}/assets`, form, {
                headers: {
                    ...form.getHeaders(),
                    'x-api-key': API_KEY,
                    // Falls benötigt, kannst du hier auch einen Dummy-Checksum-Header hinzufügen:
                    // 'x-immich-checksum': 'dummychecksum'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            console.log("Upload-Antwort:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fehler beim Upload des Assets:", error.message);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Daten:", error.response.data);
                console.error("Headers:", error.response.headers); // Logge die Response-Header
            }
            throw error;
        }
    },

    addAssetsToAlbum: async (albumId, assetIds) => {
        if (!albumId || !assetIds || !Array.isArray(assetIds)) {
            throw new Error("Ungültige Parameter: Album-ID und ein Array von Asset-IDs sind erforderlich.");
        }
        const data = { ids: assetIds };
        try {
            const response = await axios.put(`${IMMICH_API}/albums/${albumId}/assets`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-key': API_KEY
                }
            });
            console.log("Assets erfolgreich zum Album hinzugefügt:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fehler beim Hinzufügen von Assets zum Album:", error.message);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Daten:", error.response.data);
            }
            throw error;
        }
    }
};