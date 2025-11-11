import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import pinataService from "../services/pinata";
import { HealthRecord } from "../models/HealthRecord";
import type { HealthRecord as HealthRecordType } from "../types";

const router = Router();

// Configure multer for file uploads (using memory storage for IPFS upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb: FileFilterCallback) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type ${file.mimetype} is not allowed`));
  },
});

// Upload file to IPFS and create record
router.post("/", (req: Request, res: Response) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err.message.includes("File type")) {
        return res.status(400).json({ error: "Invalid file type", message: err.message });
      }
      if (err.message.includes("File too large") || err.message.includes("LIMIT_FILE_SIZE")) {
        return res.status(400).json({ error: "File too large", message: "Maximum file size is 50MB" });
      }
      return res.status(400).json({ error: "Upload error", message: err.message });
    }

    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      if (!req.file.buffer) return res.status(400).json({ error: "File buffer is missing" });

      const { name, type, date, ownerWallet } = req.body;

      if (!name || !type || !date || !ownerWallet) {
        return res.status(400).json({
          error: "Missing required fields: name, type, date, ownerWallet",
        });
      }

      // ✅ Normalize wallet address before saving
      const normalizedWallet = ownerWallet.toLowerCase();

      // Upload to Pinata IPFS using buffer
      let ipfsHash: string;
      let ipfsUrl: string;

      try {
        const pinataResponse = await pinataService.uploadBuffer(
          req.file.buffer,
          req.file.originalname,
          {
            name: req.file.originalname,
            type,
            uploadedAt: new Date().toISOString(),
            ownerWallet: normalizedWallet, // ✅ use lowercase version here too
          },
          req.file.mimetype
        );

        ipfsHash = pinataResponse.IpfsHash;
        ipfsUrl = pinataService.getFileUrl(ipfsHash);
      } catch (ipfsError) {
        return res.status(500).json({
          error: "Failed to upload to IPFS",
          message: ipfsError instanceof Error ? ipfsError.message : "Unknown error",
        });
      }

      // ✅ Save normalized wallet address
      const newRecord = new HealthRecord({
        name,
        type,
        date,
        ipfsHash,
        ipfsUrl,
        ownerWallet: normalizedWallet,
      });

      await newRecord.save();

      const formattedRecord: HealthRecordType = {
        id: String(newRecord._id),
        name: newRecord.name,
        type: newRecord.type,
        date: newRecord.date,
        ipfsHash: newRecord.ipfsHash,
        ipfsUrl: newRecord.ipfsUrl,
        ownerWallet: newRecord.ownerWallet,
        createdAt: newRecord.createdAt.toISOString(),
        updatedAt: newRecord.updatedAt.toISOString(),
      };

      res.status(201).json({
        success: true,
        record: formattedRecord,
        message: "File uploaded to IPFS and saved successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
});

export default router;
