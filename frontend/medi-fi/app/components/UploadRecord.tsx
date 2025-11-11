"use client";

import { useState } from "react";
import { uploadRecord } from "../../lib/api";

interface UploadRecordProps {
  ownerWallet: string;
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

export default function UploadRecord({ ownerWallet, onUploadSuccess, onClose }: UploadRecordProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name || !formData.type || !formData.date || !formData.file) {
      setError("Please fill in all fields and select a file");
      return;
    }

    setUploading(true);

    try {
      await uploadRecord({
        name: formData.name,
        type: formData.type,
        date: formData.date,
        ownerWallet,
        file: formData.file,
      });

      setSuccess(true);
      setFormData({ name: "", type: "", date: "", file: null });
      
      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess();
          if (onClose) onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload record");
    } finally {
      setUploading(false);
    }
  };

  if (onClose) {
    // Modal version
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-black border border-white/10 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upload Health Record</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Record Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Blood Test - May 2025"
                className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Record Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Lab Report, X-Ray, MRI"
                className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">File</label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-white/10 file:text-white file:cursor-pointer hover:file:bg-white/20"
                required
              />
              {formData.file && (
                <p className="text-xs text-white/60">Selected: {formData.file.name}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-200">
                Record uploaded successfully!
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 h-10 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Record"}
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-md border border-white/20 px-4 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Page version (no modal)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Upload Health Record</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Record Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Blood Test - May 2025"
            className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Record Type</label>
          <input
            type="text"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g., Lab Report, X-Ray, MRI"
            className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">File</label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-white/10 file:text-white file:cursor-pointer hover:file:bg-white/20"
            required
          />
          {formData.file && (
            <p className="text-xs text-white/60">Selected: {formData.file.name}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-200">
            Record uploaded successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="h-10 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Record"}
        </button>
      </form>
    </div>
  );
}

