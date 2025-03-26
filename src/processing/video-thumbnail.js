const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const generateThumbnail = (videoPath, outputFolder) => {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(videoPath, path.extname(videoPath)) + '.jpg';
        const outputFilePath = path.join(outputFolder, fileName);

        // Falls Thumbnail bereits existiert, nicht nochmal generieren
        if (fs.existsSync(outputFilePath)) {
            console.log(`Thumbnail existiert bereits: ${outputFilePath}`);
            return resolve(outputFilePath);
        }

        // FFmpeg Befehl: Extrahiert das erste Frame als JPG
        const command = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${outputFilePath}"`;

        exec(command, (error) => {
            if (error) {
                console.error("Fehler beim Generieren des Thumbnails:", error);
                return reject(error);
            }
            console.log(`Thumbnail erstellt: ${outputFilePath}`);
            resolve(outputFilePath);
        });
    });
};

module.exports = { generateThumbnail };
