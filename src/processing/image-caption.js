// image-caption.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function getImageCaptionLocal(imagePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  const response = await axios.post('http://localhost:5000/caption', form, {
    headers: form.getHeaders()
  });
  return response.data.caption;
}

module.exports = { getImageCaptionLocal };
