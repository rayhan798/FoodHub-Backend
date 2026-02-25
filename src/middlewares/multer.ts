import multer from "multer";
import path from "path";
import fs from "fs";

// FIXED upload directory for Vercel and local
const uploadDir =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "uploads");

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const isExtMatch = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const isMimeMatch = allowedTypes.test(file.mimetype);

  if (isExtMatch && isMimeMatch) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only .png, .jpg, .jpeg and .webp format allowed!"
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});