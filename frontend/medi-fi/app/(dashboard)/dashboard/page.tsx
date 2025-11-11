import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="Overview of your health records, access activity, and connected providers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Records" value={3} hint="On-chain & off-chain refs" />
        <StatCard label="Shared With" value={2} hint="Active providers" />
        <StatCard label="Access Requests" value={2} hint="Pending approvals" />
        <StatCard label="Last Sync" value="1h ago" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>Dr. John Doe accessed "Blood Test - May 2025"</li>
            <li>Shared "MRI Results - Apr 2025" with City Hospital</li>
            <li>Revoked access for "Clinic ABC"</li>
          </ul>
        </section>
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold">Upcoming Appointments</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>Nov 05, 10:00 — Dr. John Doe (Telemed)</li>
            <li>Nov 12, 14:30 — City Hospital (Radiology)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}


