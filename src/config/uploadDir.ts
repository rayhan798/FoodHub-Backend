import path from "path";
import fs from "fs";

export const uploadDir =
  process.env.VERCEL
    ? "/tmp/uploads"
    : path.join(process.cwd(), "uploads");

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.error(err);
}