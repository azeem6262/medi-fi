"use client";

import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import UploadRecord from "../../components/UploadRecord";
import { getRecords, deleteRecord, getDownloadUrl, type HealthRecord } from "../../../lib/api";
import { useWallet } from "@/lib/useWallet";

export default function RecordsPage() {
  const { walletAddress, connectWallet, isConnecting, error: walletError } = useWallet();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!walletAddress) return; // only fetch if wallet is connected
    try {
      setLoading(true);
      setError(null);
      const data = await getRecords(walletAddress);

      // handle response safely
      if (Array.isArray(data)) {
        setRecords(data as HealthRecord[]);
      } else if (data && typeof data === "object" && "records" in data && Array.isArray((data as any).records)) {
        setRecords((data as { records: HealthRecord[] }).records);
      } else {
        setRecords([]);
        console.warn("Unexpected response format:", data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // useEffect dependencies must be static, so we wrap it safely
    if (typeof window === "undefined") return;
  
    // fetch only when walletAddress is available
    if (walletAddress) {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress ?? ""]);
  

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      setDeletingId(id);
      await deleteRecord(id);
      await fetchRecords();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (record: HealthRecord) => {
    window.open(record.ipfsUrl, "_blank");
  };

  const handleDownload = (recordId: string) => {
    window.open(getDownloadUrl(recordId), "_blank");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  // if wallet not connected
  if (!walletAddress) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold mb-4 text-white">Connect Your Wallet</h2>
        <p className="text-white/70 mb-4">Please connect MetaMask to view and manage your health records.</p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="rounded-md bg-white text-black px-4 py-2 text-sm hover:bg-white/90 disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {walletError && <p className="mt-3 text-sm text-red-400">{walletError}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Records"
        description={`Viewing records for wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
        action={
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-md border border-white/20 bg-white text-black px-3 py-2 text-sm hover:bg-white/90"
          >
            Upload Record
          </button>
        }
      />

      {showUploadModal && (
        <UploadRecord
          ownerWallet={walletAddress}
          onUploadSuccess={fetchRecords}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/20 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
          Loading records...
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/60 mb-4">No records found for this wallet.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-md border border-white/20 bg-white text-black px-4 py-2 text-sm hover:bg-white/90"
          >
            Upload Your First Record
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">IPFS Hash</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-white/10">
                  <td className="p-3">{record.name}</td>
                  <td className="p-3">{record.type}</td>
                  <td className="p-3">{formatDate(record.date)}</td>
                  <td className="p-3 font-mono text-xs text-white/60">
                    {truncateHash(record.ipfsHash)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(record)}
                        className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(record.id)}
                        className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="rounded-md border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === record.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
