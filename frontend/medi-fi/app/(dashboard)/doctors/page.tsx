import SectionHeader from "../../components/SectionHeader";

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Doctors & Providers"
        description="Manage your trusted providers and their access to your records."
        action={
          <button className="rounded-md border border-white/20 bg-white text-black px-3 py-2 text-sm">
            Add Provider
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Dr. John Doe", "City Hospital", "Clinic ABC"].map((name) => (
          <div key={name} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-white/60 mt-1">0xabc...1234</div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-md border border-white/20 px-2 py-1 text-sm">View</button>
              <button className="rounded-md border border-white/20 px-2 py-1 text-sm">Revoke</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


