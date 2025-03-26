// image-caption.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function getImageCaptionLocal(imagePath) {
  const form = new FormData();
  const captionApiUrl = process.env.CAPTION_API_URL;

  form.append('file', fs.createReadStream(imagePath));
  const response = await axios.post(captionApiUrl, form, {
    headers: form.getHeaders()
  });
  return response.data.caption;
}

module.exports = { getImageCaptionLocal };
