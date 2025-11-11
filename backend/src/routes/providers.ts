import { Router, Request, Response } from "express";
import { z } from "zod";
import type { Provider, CreateProviderRequest } from "../types";

const router = Router();

// In-memory store (replace with database later)
const providers: Provider[] = [];

const createProviderSchema = z.object({
  name: z.string().min(1),
  walletAddress: z.string().min(1),
});

// Get all providers
router.get("/", (req: Request, res: Response) => {
  const { walletAddress } = req.query;

  let filteredProviders = providers;

  if (walletAddress && typeof walletAddress === "string") {
    filteredProviders = filteredProviders.filter((p) => p.walletAddress === walletAddress);
  }

  res.json(filteredProviders);
});

// Get a specific provider
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = providers.find((p) => p.id === id);

  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }

  res.json(provider);
});

// Create a new provider
router.post("/", (req: Request, res: Response) => {
  try {
    const validated = createProviderSchema.parse(req.body);
    const { name, walletAddress } = validated;

    // Check if provider already exists
    const existingProvider = providers.find((p) => p.walletAddress === walletAddress);
    if (existingProvider) {
      return res.status(400).json({ error: "Provider with this wallet address already exists" });
    }

    const newProvider: Provider = {
      id: `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      walletAddress,
      createdAt: new Date().toISOString(),
    };

    providers.push(newProvider);
    res.status(201).json(newProvider);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create provider" });
  }
});

// Update a provider
router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const providerIndex = providers.findIndex((p) => p.id === id);

  if (providerIndex === -1) {
    return res.status(404).json({ error: "Provider not found" });
  }

  const updates = req.body;
  providers[providerIndex] = {
    ...providers[providerIndex],
    ...updates,
  };

  res.json(providers[providerIndex]);
});

// Delete a provider
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const providerIndex = providers.findIndex((p) => p.id === id);

  if (providerIndex === -1) {
    return res.status(404).json({ error: "Provider not found" });
  }

  providers.splice(providerIndex, 1);
  res.status(204).send();
});

export default router;
