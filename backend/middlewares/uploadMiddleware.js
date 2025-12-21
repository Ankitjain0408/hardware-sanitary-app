import multer from "multer";

// Cloudinary-only: use memory storage so we can upload the buffer to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (increased for PDF catalogs)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed"), false);
    }
  },
});

export default upload;

