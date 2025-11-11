import { Router, Request, Response } from "express";
import { z } from "zod";
import type { AccessGrant, CreateAccessGrantRequest } from "../types";

const router = Router();

// In-memory store (replace with database later)
const accessGrants: AccessGrant[] = [];

const createAccessGrantSchema = z.object({
  recordId: z.string().min(1),
  providerWallet: z.string().min(1),
  providerName: z.string().optional(),
  expiresAt: z.string(),
});

// Get all access grants for a record or provider
router.get("/", (req: Request, res: Response) => {
  const { recordId, providerWallet, ownerWallet } = req.query;

  let filteredGrants = accessGrants;

  if (recordId && typeof recordId === "string") {
    filteredGrants = filteredGrants.filter((g) => g.recordId === recordId);
  }

  if (providerWallet && typeof providerWallet === "string") {
    filteredGrants = filteredGrants.filter((g) => g.providerWallet === providerWallet);
  }

  // Filter by owner's records (requires record lookup - simplified for now)
  if (ownerWallet && typeof ownerWallet === "string") {
    // In a real app, you'd join with records table
    filteredGrants = filteredGrants.filter((g) => {
      // This is a simplified check - you'd need to verify ownership through records
      return g.status === "active";
    });
  }

  // Update status based on expiry
  const now = new Date();
  filteredGrants = filteredGrants.map((grant) => {
    if (new Date(grant.expiresAt) < now && grant.status === "active") {
      grant.status = "expired";
    }
    return grant;
  });

  res.json(filteredGrants);
});

// Get a specific access grant
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const grant = accessGrants.find((g) => g.id === id);

  if (!grant) {
    return res.status(404).json({ error: "Access grant not found" });
  }

  // Update status if expired
  if (new Date(grant.expiresAt) < new Date() && grant.status === "active") {
    grant.status = "expired";
  }

  res.json(grant);
});

// Create a new access grant
router.post("/", (req: Request, res: Response) => {
  try {
    const validated = createAccessGrantSchema.parse(req.body);
    const { recordId, providerWallet, providerName, expiresAt } = validated;

    // Check if grant already exists and is active
    const existingGrant = accessGrants.find(
      (g) => g.recordId === recordId && g.providerWallet === providerWallet && g.status === "active"
    );

    if (existingGrant) {
      return res.status(400).json({ error: "Active access grant already exists for this provider and record" });
    }

    const newGrant: AccessGrant = {
      id: `grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recordId,
      providerWallet,
      providerName,
      expiresAt,
      createdAt: new Date().toISOString(),
      status: new Date(expiresAt) > new Date() ? "active" : "expired",
    };

    accessGrants.push(newGrant);
    res.status(201).json(newGrant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create access grant" });
  }
});

// Revoke an access grant
router.patch("/:id/revoke", (req: Request, res: Response) => {
  const { id } = req.params;
  const grantIndex = accessGrants.findIndex((g) => g.id === id);

  if (grantIndex === -1) {
    return res.status(404).json({ error: "Access grant not found" });
  }

  accessGrants[grantIndex].status = "revoked";
  res.json(accessGrants[grantIndex]);
});

// Delete an access grant
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const grantIndex = accessGrants.findIndex((g) => g.id === id);

  if (grantIndex === -1) {
    return res.status(404).json({ error: "Access grant not found" });
  }

  accessGrants.splice(grantIndex, 1);
  res.status(204).send();
});

export default router;
