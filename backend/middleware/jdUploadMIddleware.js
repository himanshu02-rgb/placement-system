const multer = require('multer');

// Keeps the PDF in memory (req.file.buffer) instead of writing it to disk,
// because we only need the text from it.
const jdUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = jdUpload;