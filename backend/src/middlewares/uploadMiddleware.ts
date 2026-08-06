import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError";

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Sanitize original filename to prevent directory traversal or weird character issues
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Add or remove MIME types based on what documents your AI assistant needs to support
  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only PDF, TXT, and DOCX files are allowed.",
        400,
      ),
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
  fileFilter,
});
