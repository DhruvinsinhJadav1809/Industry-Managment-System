import multer from "multer";
import path from "path";
import fs from "fs";
import { imageFileFilter } from "./file-filter";

const uploadPath = path.join(process.cwd(), "uploads", "company");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `company-${uniqueName}${path.extname(file.originalname)}`);
  },
});

export const uploadLogo = multer({
  storage,

  fileFilter: imageFileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});
