const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===============================
// ENSURE UPLOAD FOLDER EXISTS
// ===============================
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===============================
// MULTER STORAGE CONFIG
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueName}${ext}`);
  },
});

// ===============================
// FILE FILTER (IMAGE ONLY)
// ===============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"));
  }
};

// ===============================
// MULTER INSTANCE
// ===============================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

// ===============================
// SINGLE FILE UPLOAD
// ===============================
const uploadSingle = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

// ===============================
// DELETE FILE HELPER
// ===============================
const deleteFile = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  uploadSingle,
  deleteFile,
};
