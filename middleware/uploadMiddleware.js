const multer = require('multer');

// Configure multer to use memory storage since we will upload buffers to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = upload;
