import multer from "multer";
import path from "path";
import fs from "fs";

// Temp upload directory
const TEMP_UPLOAD_PATH = path.join(__dirname, "../temp/uploads");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_UPLOAD_PATH)) {
  fs.mkdirSync(TEMP_UPLOAD_PATH, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    // Keep original file name (or generate a unique one)
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File type filter
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "application/pdf",
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, or PDF files are allowed"));
    }
  },
});

export const multerMiddleware = upload.single("file"); // Use "file" as the field name for uploads