import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export interface UploadRecordRequest {
  name: string;
  type: string;
  date: string;
  ownerWallet: string;
  file: File;
}

export interface UploadRecordResponse {
  success: boolean;
  record: HealthRecord;
  message: string;
}

// Get all records for a user
export const getRecords = async (ownerWallet: string): Promise<HealthRecord[]> => {
  const response = await api.get<HealthRecord[]>("/records", {
    params: { ownerWallet },
  });
  return response.data;
};

// Get a specific record
export const getRecord = async (id: string): Promise<HealthRecord> => {
  const response = await api.get<HealthRecord>(`/records/${id}`);
  return response.data;
};

// Upload a record file
export const uploadRecord = async (data: UploadRecordRequest): Promise<UploadRecordResponse> => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("date", data.date);
  formData.append("ownerWallet", data.ownerWallet);

  const response = await api.post<UploadRecordResponse>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete a record
export const deleteRecord = async (id: string): Promise<void> => {
  await api.delete(`/records/${id}`);
};

// Get download URL for a record
export const getDownloadUrl = (recordId: string): string => {
  return `${API_BASE_URL}/records/${recordId}/download`;
};

export default api;

