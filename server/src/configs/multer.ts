import multer from "multer";

const storage = multer.diskStorage({
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(null, false);
      return;
    }
    cb(null, true);
  },
});

export default upload;
