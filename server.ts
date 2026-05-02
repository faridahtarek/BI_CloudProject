import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Memory-based database (Placeholder for RDS/DynamoDB)
// In a real AWS scenario, this would be a DynamoDB table or RDS database.
interface Profile {
  id: string;
  name: string;
  age: number;
  position: string;
  imageUrl: string;
  createdAt: string;
}

let profiles: Profile[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Static folder for uploads
  // AWS S3 Tip: In production, you would serve these from an S3 bucket URL.
  app.use("/uploads", express.static(uploadDir));

  // --- API Routes ---

  // GET all profiles
  app.get("/api/profiles", (req, res) => {
    res.json(profiles);
  });

  // POST create profile
  // AWS Tip: This is where you would use IAM roles to grant permission
  // for your EC2 instance to write to DynamoDB and upload to S3.
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  const upload = multer({ storage });

  app.post("/api/profiles", upload.single("image"), (req, res) => {
    try {
      const { name, age, position } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const newProfile: Profile = {
        id: uuidv4(),
        name,
        age: parseInt(age),
        position,
        imageUrl: `/uploads/${file.filename}`, // Using relative URL for now
        createdAt: new Date().toISOString(),
      };

      profiles.push(newProfile);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Development mode: ${process.env.NODE_ENV !== "production"}`);
  });
}

startServer();
