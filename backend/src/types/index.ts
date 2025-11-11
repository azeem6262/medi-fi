export interface HealthRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  ipfsHash: string;
  ipfsUrl: string;
  ownerWallet: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessGrant {
  id: string;
  recordId: string;
  providerWallet: string;
  providerName?: string;
  expiresAt: string;
  createdAt: string;
  status: "active" | "expired" | "revoked";
}

export interface Provider {
  id: string;
  name: string;
  walletAddress: string;
  createdAt: string;
  recordsAccessCount?: number;
}

export interface CreateRecordRequest {
  name: string;
  type: string;
  date: string;
  ownerWallet: string;
}

export interface CreateAccessGrantRequest {
  recordId: string;
  providerWallet: string;
  providerName?: string;
  expiresAt: string;
}

export interface CreateProviderRequest {
  name: string;
  walletAddress: string;
}
