const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { runFFmpegCommand } = require('./ffmpeg-utils');
const { processImageWithDuration } = require('./ffmpeg');
const { spawn, execSync, exec } = require('child_process');

function parseTimeStringToMs(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 5000;
  const [hours, minutes, secondsParts] = parts;
  const [seconds, ms] = secondsParts.split('.').map(n => parseInt(n || '0', 10));
  return ((parseInt(hours) * 3600) + (parseInt(minutes) * 60) + seconds) * 1000 + (ms || 0);
}

function hasAudioTrack(filePath) {
  return new Promise(resolve => {
    const ffprobe = spawn('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'default=noprint_wrappers=1:nokey=1', filePath]);
    let stdout = '';
    ffprobe.stdout.on('data', data => stdout += data);
    ffprobe.on('close', () => resolve(stdout.includes('audio')));
  });
}

function hasAudioStream(filePath) {
  try {
    const output = execSync(`ffprobe -i "${filePath}" -show_streams -select_streams a -loglevel error`).toString();
    return output.includes('[STREAM]');
  } catch (err) {
    console.error('ffprobe error:', err);
    return false;
  }
}

function getDurationInSeconds(filePath) {
  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    return parseFloat(output.toString().trim());
  } catch (err) {
    console.error('Duration error:', err);
    return 5;
  }
}

function ensureAudioTrack(filePath) {
  if (hasAudioStream(filePath)) return filePath;
  const duration = getDurationInSeconds(filePath);
  const silentFilePath = filePath.replace(/\.mp4$/, '_with_audio.mp4');
  if (!fs.existsSync(silentFilePath)) {
    const cmd = `ffmpeg -y -i "${filePath}" -f lavfi -t ${duration} -i anullsrc=channel_layout=stereo:sample_rate=48000 -c:v copy -c:a aac -shortest "${silentFilePath}"`;
    execSync(cmd);
  }
  return silentFilePath;
}

async function processVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setFfmpegPath('/usr/bin/ffmpeg')
      .outputOptions([
        '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
        '-r', '25',
        '-vsync', 'vfr',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'copy'
      ])
      .on('start', commandLine => console.log(`FFmpeg startet (Video): ${commandLine}`))
      .on('end', () => {
        console.log(`✅ Video erfolgreich verarbeitet: ${outputPath}`);
        resolve();
      })
      .on('error', err => {
        console.error(`❌ Fehler beim Verarbeiten des Videos: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}

async function generateFinalVideo(options, outputPath) {
  try {
    if (!options || !options.media) throw new Error('Export-Optionen ungültig: media fehlt.');

    const timelineAssets = options.media;
    const mediaFolder = path.join(__dirname, '../../medien');
    const tempFolder = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

    const processedClips = [];
    const transitions = [];
    let videoIndex = 0;

    for (let i = 0; i < timelineAssets.length; i++) {
      const asset = timelineAssets[i];
      if (asset.type === 'TRANSITION') {
        transitions.push({ transition: asset.transition || 'fade', duration: (asset.duration || 1000) / 1000 });
        continue;
      }
      if (!asset.downloadName) continue;

      const ext = path.extname(asset.downloadName).toLowerCase();
      const inputPath = path.join(mediaFolder, asset.downloadName);
      const clipOutput = path.join(tempFolder, `clip_${videoIndex}.mp4`);
      const durationMs = asset.duration || 5000;
      const durationSec = durationMs / 1000;

      if (asset.type === 'IMAGE') {
        await processImageWithDuration(inputPath, clipOutput, durationSec);
      } else {
        await processVideo(inputPath, clipOutput);
      }

      const clipWithAudio = ensureAudioTrack(clipOutput);

      processedClips.push({
        clipOutput: clipWithAudio,
        duration: durationMs,
        durationSec,
        hasAudio: true
      });

      videoIndex++;
    }

    if (processedClips.length === 0) throw new Error('❌ Keine Clips vorhanden – Video kann nicht erstellt werden.');

    await createFinalVideoWithTransitions(processedClips, outputPath, transitions);
    console.log(`✅ Export abgeschlossen: ${outputPath}`);
    // ⬇️ NEU: Nur verwendete Dateien behalten
const usedFiles = timelineAssets
.filter(asset => asset.downloadName)
.map(asset => asset.downloadName);

cleanAllMediaFiles();
    return outputPath;
  } catch (error) {
    console.error("❌ Fehler in generateFinalVideo:", error);
    throw error;
  }
}

function cleanUnusedMedia(usedFiles = []) {
  const mediaDir = path.join(__dirname, '../../', 'medien');
  const whitelist = new Set(usedFiles);
  const validExt = ['.jpg', '.jpeg', '.png', '.mp4', '.mov'];

  fs.readdir(mediaDir, (err, files) => {
    if (err) return console.error('Fehler beim Lesen des Medien-Ordners:', err);

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!validExt.includes(ext)) return;

      if (!whitelist.has(file)) {
        const fullPath = path.join(mediaDir, file);
        fs.unlink(fullPath, err => {
          if (err) console.error(`❌ Konnte ${file} nicht löschen:`, err);
          else console.log(`🗑️ Nicht verwendete Datei gelöscht: ${file}`);
        });
      }
    });
  });
}

function cleanAllMediaFiles() {
  const folders = [
    '../../medien',
  '../../medien/thumbnails',
  './medien'
  ];

  const validExt = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.webp', '.txt'];

  folders.forEach(dir => {
    const fullPath = path.resolve(__dirname, dir);

    fs.readdir(fullPath, (err, files) => {
      if (err) return console.error(`❌ Fehler beim Lesen von ${fullPath}:`, err);

      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (!validExt.includes(ext)) return;

        const filePath = path.join(fullPath, file);
        fs.unlink(filePath, err => {
          if (err) console.error(`❌ Konnte ${filePath} nicht löschen:`, err);
          else console.log(`🧹 Gelöscht: ${filePath}`);
        });
      });
    });
  });
}

function createFinalVideoWithTransitions(mediaFiles, outputPath, transitions = []) {
  const inputArgs = mediaFiles.map(file => `-i "${file.clipOutput}"`).join(' ');
  const filterParts = [];
  const audioParts = [];
  let videoOut = '';
  let audioOut = '';
  let accumulatedOffset = 0;

  if (!Array.isArray(mediaFiles) || mediaFiles.length <= 1) {
    console.log("⚠️ Zu wenig Clips für Übergänge. Kein FilterGraph nötig.");
    fs.copyFileSync(mediaFiles[0].clipOutput, outputPath);
    return;
  }

  for (let i = 0; i < mediaFiles.length - 1; i++) {
    const inputA = i === 0 ? `[${i}:v]` : `[v${i}]`;
    const inputB = `[${i + 1}:v]`;
    const outLabel = i === mediaFiles.length - 2 ? 'vout' : `v${i + 1}`;
    const trans = transitions[i] || {};
    const transType = trans.transition || 'fade';
    const transDuration = (trans.duration || 1) ;
    accumulatedOffset += (mediaFiles[i].durationSec || 5) - transDuration;
    filterParts.push(`${inputA}${inputB}xfade=transition=${transType}:duration=${transDuration}:offset=${accumulatedOffset.toFixed(3)}[${outLabel}]`);
    videoOut = `[${outLabel}]`;

    const inputA_a = i === 0 ? `[${i}:a]` : `[a${i}]`;
    const inputB_a = `[${i + 1}:a]`;
    const outLabelA = i === mediaFiles.length - 2 ? 'aout' : `a${i + 1}`;
    audioParts.push(`${inputA_a}${inputB_a}acrossfade=d=${transDuration}:c1=exp:c2=exp[${outLabelA}]`);
    audioOut = `[${outLabelA}]`;
  }

  const filterComplex = [...filterParts, ...audioParts].join('; ');
  const ffmpegCommand = `ffmpeg ${inputArgs} -filter_complex "${filterComplex}" -map "${videoOut}" -map "${audioOut}" -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 192k -y "${outputPath}"`;

  console.log('[createFinalVideoWithTransitions] FFmpeg Command:\n' + ffmpegCommand);
  execSync(ffmpegCommand, { stdio: 'inherit' });
  const tempDir = path.join(__dirname, '../../temp');
fs.readdirSync(tempDir).forEach(file => {
  if (file.endsWith('.mp4') || file.endsWith('.txt')) {
    const filePath = path.join(tempDir, file);
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`⚠️ Fehler beim Löschen von ${filePath}`);
    }
  }
});

}

module.exports = { generateFinalVideo, generateVideo: generateFinalVideo };
