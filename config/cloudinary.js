const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary configured.');
} else {
  console.warn('Cloudinary environment variables not found. Image upload will not work.');
}

module.exports = cloudinary;
