import SectionHeader from "../../components/SectionHeader";

export default function SharePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Share Access"
        description="Grant time-bound, scoped access to your records via smart contracts."
      />

      <form className="grid gap-4 max-w-xl">
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Provider Address (Wallet)</label>
          <input
            placeholder="0x..."
            className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Record</label>
          <select className="h-10 rounded-md bg-white/5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
            <option>Blood Test - May 2025</option>
            <option>MRI Results - Apr 2025</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Access Expiry</label>
          <input type="datetime-local" className="h-10 rounded-md bg-white/5 px-3 text-sm" />
        </div>
        <button className="mt-2 h-10 rounded-md bg-white text-black text-sm font-medium">
          Create Access Grant
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="font-semibold">Active Grants</h3>
        <ul className="mt-3 text-sm text-white/80 space-y-2">
          <li>City Hospital — MRI Results — Expires in 5 days</li>
          <li>Dr. Khan — Blood Test — Expires in 2 days</li>
        </ul>
      </div>
    </div>
  );
}


