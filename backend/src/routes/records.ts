import { Router, Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { HealthRecord } from "../models/HealthRecord";
import type { HealthRecord as HealthRecordType } from "../types";

const router = Router();

// Enhanced validation schema
const createRecordSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().min(1, "Type is required"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  ownerWallet: z.string()
    .min(42, "Invalid wallet address")
    .max(42, "Invalid wallet address")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
  ipfsHash: z.string().optional(),
  ipfsUrl: z.string().url().optional(),
});

const updateRecordSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }).optional(),
});

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to format record response
const formatRecord = (record: any): HealthRecordType => ({
  id: String(record._id),
  name: record.name,
  type: record.type,
  date: record.date,
  ipfsHash: record.ipfsHash || "",
  ipfsUrl: record.ipfsUrl || "",
  ownerWallet: record.ownerWallet,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

// Get all records for a user
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { ownerWallet } = req.query;

    // Validate ownerWallet parameter
    if (!ownerWallet || typeof ownerWallet !== "string") {
      return res.status(400).json({ 
        error: "ownerWallet query parameter is required" 
      });
    }

    // Validate wallet format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(ownerWallet)) {
      return res.status(400).json({ 
        error: "Invalid wallet address format" 
      });
    }

    // Normalize wallet address to lowercase for case-insensitive search
    const normalizedWallet = ownerWallet.toLowerCase();

    const records = await HealthRecord.find({ 
      ownerWallet: normalizedWallet 
    })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    const formattedRecords: HealthRecordType[] = records.map(formatRecord);

    res.json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch records",
      message: errorMessage
    });
  }
});

// Get a specific record
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid record ID format" 
      });
    }

    const record = await HealthRecord.findById(id).lean();

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: "Record not found" 
      });
    }

    res.json({
      success: true,
      record: formatRecord(record)
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch record",
      message: errorMessage
    });
  }
});

// Create a new record
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body
    const validated = createRecordSchema.parse(req.body);
    const { name, type, date, ownerWallet, ipfsHash, ipfsUrl } = validated;

    // Normalize wallet address
    const normalizedWallet = ownerWallet.toLowerCase();

    // Check for duplicate records (optional - same name, type, and date)
    const existingRecord = await HealthRecord.findOne({
      name,
      type,
      date,
      ownerWallet: normalizedWallet
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        error: "A record with the same details already exists"
      });
    }

    const newRecord = new HealthRecord({
      name,
      type,
      date,
      ipfsHash: ipfsHash || "",
      ipfsUrl: ipfsUrl || "",
      ownerWallet: normalizedWallet,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      record: formatRecord(newRecord)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: "Validation error", 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating record:", errorMessage);
    res.status(500).json({ 
      success: false,
      error: "Failed to create record",
      message: errorMessage
    });
  }
});

// Update a record
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid record ID format" 
      });
    }

    // Validate update data
    const validated = updateRecordSchema.parse(req.body);

    // Check if record exists
    const record = await HealthRecord.findById(id);

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: "Record not found" 
      });
    }

    // Optional: Add ownership check
    // if (req.body.ownerWallet && record.ownerWallet !== req.body.ownerWallet.toLowerCase()) {
    //   return res.status(403).json({ 
    //     success: false,
    //     error: "Not authorized to update this record" 
    //   });
    // }

    // Update allowed fields
    if (validated.name !== undefined) record.name = validated.name;
    if (validated.type !== undefined) record.type = validated.type;
    if (validated.date !== undefined) record.date = validated.date;

    await record.save();

    res.json({
      success: true,
      message: "Record updated successfully",
      record: formatRecord(record)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: "Validation error", 
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error("Error updating record:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      error: "Failed to update record",
      message: errorMessage
    });
  }
});

// Delete a record
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid record ID format" 
      });
    }

    const record = await HealthRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: "Record not found" 
      });
    }

    // Optional: Delete from IPFS/Pinata here if needed
    // if (record.ipfsHash) {
    //   await unpinFromPinata(record.ipfsHash);
    // }

    res.json({
      success: true,
      message: "Record deleted successfully",
      deletedRecord: {
        id: String(record._id),
        name: record.name
      }
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      error: "Failed to delete record",
      message: errorMessage
    });
  }
});

// Download a record file from IPFS
router.get("/:id/download", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid record ID format" 
      });
    }

    const record = await HealthRecord.findById(id).lean();

    if (!record) {
      return res.status(404).json({ 
        success: false,
        error: "Record not found" 
      });
    }

    if (!record.ipfsUrl || !record.ipfsHash) {
      return res.status(404).json({ 
        success: false,
        error: "File not available on IPFS" 
      });
    }

    // Optional: Add access control here
    // Check if requester has permission to download

    // Log download activity (recommended for audit trail)
    console.log(`File download requested: Record ID ${id}, IPFS Hash: ${record.ipfsHash}`);

    // Instead of redirect, you could fetch and stream the file
    // This gives you more control and better error handling
    
    // Option 1: Redirect to IPFS gateway (current approach)
    res.redirect(record.ipfsUrl);

    // Option 2: Fetch and stream (more control, uncomment if needed)
    /*
    const axios = require('axios');
    const response = await axios.get(record.ipfsUrl, {
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${record.name}"`);
    
    response.data.pipe(res);
    */
  } catch (error) {
    console.error("Error downloading record:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      error: "Failed to download record",
      message: errorMessage
    });
  }
});

export default router;