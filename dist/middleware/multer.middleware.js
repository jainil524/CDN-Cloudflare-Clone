"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Temp upload directory
const TEMP_UPLOAD_PATH = path_1.default.join(__dirname, "../temp/uploads");
// Ensure temp directory exists
if (!fs_1.default.existsSync(TEMP_UPLOAD_PATH)) {
    fs_1.default.mkdirSync(TEMP_UPLOAD_PATH, { recursive: true });
}
// Multer disk storage
const storage = multer_1.default.diskStorage({
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
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPEG, PNG, GIF, or PDF files are allowed"));
        }
    },
});
exports.multerMiddleware = upload.single("file"); // Use "file" as the field name for uploads
