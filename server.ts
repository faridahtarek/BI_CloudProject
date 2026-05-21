import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } from "@aws-sdk/client-cloudwatch-logs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- AWS Clients (use EC2 Instance Role, no keys needed) ---
const s3 = new S3Client({ region: process.env.AWS_REGION });

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION })
);

const cloudwatch = new CloudWatchLogsClient({ region: process.env.AWS_REGION });
const LOG_GROUP = "/cloud-project/server";
const LOG_STREAM = `stream-${Date.now()}`;

const BUCKET = process.env.S3_BUCKET_NAME!;
const TABLE = process.env.DYNAMODB_TABLE!;

// --- CloudWatch helpers ---
async function initLogStream() {
  try {
    await cloudwatch.send(new CreateLogStreamCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
    }));
  } catch (e) { }
}

async function logToCloudWatch(message: string) {
  try {
    await cloudwatch.send(new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [{ timestamp: Date.now(), message }],
    }));
  } catch (e) { }
}

// --- Profile type ---
interface Profile {
  id: string;
  name: string;
  age: number;
  position: string;
  imageUrl: string;
  createdAt: string;
}

// --- Multer: memory storage (no local disk) ---
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  await initLogStream();

  app.use(cors());
  app.use(express.json());

  // GET all profiles — reads from DynamoDB
  app.get("/api/profiles", async (req, res) => {
    try {
      const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
      res.json(result.Items || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  // POST create profile — uploads image to S3, saves metadata to DynamoDB
  app.post("/api/profiles", upload.single("image"), async (req, res) => {
    try {
      const { name, age, position } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Image is required" });
      }

      // 1. Upload image to S3
      const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));

      // 2. Build the public S3 URL
      const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // 3. Save profile metadata to DynamoDB
      const newProfile: Profile = {
        id: uuidv4(),
        name,
        age: parseInt(age),
        position,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      await dynamo.send(new PutCommand({
        TableName: TABLE,
        Item: newProfile,
      }));

      // 4. Log to CloudWatch
      await logToCloudWatch(`New profile created: ${newProfile.name}, ${newProfile.position}`);

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
  });
}

startServer();