const multer = require("multer");
const path = require("path");

// Stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB par fichier
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf" && ext !== ".json") {
      return cb(new Error("Seuls les fichiers PDF et JSON sont autorisés"));
    }
    cb(null, true);
  }
});

module.exports = upload;