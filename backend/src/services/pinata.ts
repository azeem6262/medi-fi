import axios, { AxiosInstance } from "axios";
import FormData from "form-data";
import fs from "fs";

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataPinResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

class PinataService {
  private jwt: string;
  private gatewayUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    // JWT is the new preferred method
    

    this.jwt = process.env.PINATA_JWT || "";
    
    
    
    this.gatewayUrl = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

    // Check if we have authentication
    if (!this.jwt) {
      console.warn("⚠️  Pinata credentials not set. IPFS features will not work.");
      console.warn("Please set either PINATA_JWT or both PINATA_API_KEY and PINATA_SECRET_KEY");
    }

    // Create axios instance with appropriate auth
    const headers: Record<string, string> = {};
    
    if (this.jwt) {
      // JWT authentication (new method)
      headers["Authorization"] = `Bearer ${this.jwt}`;
      console.log("✅ Using Pinata JWT authentication");
    }

    this.axiosInstance = axios.create({
      baseURL: "https://api.pinata.cloud",
      headers,
      timeout: 120000, // 2 minute timeout for large files
    });
  }

  /**
   * Test Pinata connection
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get("/data/testAuthentication");
      console.log("✅ Pinata authentication successful:", response.data);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Pinata authentication failed:", error.response?.data || error.message);
        console.error("Status:", error.response?.status);
        console.error("Headers sent:", error.config?.headers);
      }
      return false;
    }
  }

  /**
   * Upload a file to Pinata IPFS
   */
  async uploadFile(filePath: string, metadata?: Record<string, unknown>): Promise<PinataUploadResponse> {
    if (!this.jwt) {
      throw new Error("Pinata credentials not configured");
    }

    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      formData.append("file", fileStream);

      if (metadata) {
        formData.append("pinataMetadata", JSON.stringify({
          name: metadata.name || "health-record",
          keyvalues: metadata,
        }));
      }

      // Add pinata options for better performance
      formData.append("pinataOptions", JSON.stringify({
        cidVersion: 1,
      }));

      const response = await this.axiosInstance.post<PinataUploadResponse>(
        "/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log("✅ File uploaded to IPFS:", response.data.IpfsHash);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Pinata upload error:", error.response?.data);
        throw new Error(`Pinata upload failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Upload a buffer to Pinata IPFS
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    metadata?: Record<string, unknown>,
    mimetype?: string
  ): Promise<PinataUploadResponse> {
    if (!this.jwt) {
      throw new Error("Pinata credentials not configured");
    }

    try {
      console.log(`📤 Uploading buffer: ${filename} (${buffer.length} bytes)`);

      const formData = new FormData();
      formData.append("file", buffer, {
        filename,
        contentType: mimetype || "application/octet-stream",
      });

      if (metadata) {
        formData.append("pinataMetadata", JSON.stringify({
          name: filename,
          keyvalues: metadata,
        }));
      }

      // Add pinata options
      formData.append("pinataOptions", JSON.stringify({
        cidVersion: 1,
      }));

      const response = await this.axiosInstance.post<PinataUploadResponse>(
        "/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log("✅ Buffer uploaded to IPFS:", response.data.IpfsHash);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Pinata buffer upload error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(`Pinata upload failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get file URL from IPFS hash
   */
  getFileUrl(ipfsHash: string): string {
    // Use a public gateway for viewing/downloading
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    // or: return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  /**
   * Pin JSON data to IPFS
   */
  async pinJSON(jsonData: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<PinataPinResponse> {
    if (!this.jwt) {
      throw new Error("Pinata credentials not configured");
    }

    try {
      const response = await this.axiosInstance.post<PinataPinResponse>(
        "/pinning/pinJSONToIPFS",
        {
          pinataContent: jsonData,
          pinataMetadata: metadata ? {
            name: (metadata.name as string) || "health-data",
            keyvalues: metadata,
          } : undefined,
          pinataOptions: {
            cidVersion: 1,
          }
        }
      );

      console.log("✅ JSON pinned to IPFS:", response.data.IpfsHash);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Pinata JSON pin error:", error.response?.data);
        throw new Error(`Pinata JSON pin failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Unpin a file from IPFS
   */
  async unpin(hash: string): Promise<void> {
    if (!this.jwt) {
      throw new Error("Pinata credentials not configured");
    }

    try {
      await this.axiosInstance.delete(`/pinning/unpin/${hash}`);
      console.log("✅ File unpinned from IPFS:", hash);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Pinata unpin error:", error.response?.data);
        throw new Error(`Pinata unpin failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get pinned files list
   */
  async listPins(limit: number = 10): Promise<any> {
    if (!this.jwt) {
      throw new Error("Pinata credentials not configured");
    }

    try {
      const response = await this.axiosInstance.get("/data/pinList", {
        params: {
          status: "pinned",
          pageLimit: limit,
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to list pins: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}

export default new PinataService();