export default function StatCard({ icon, label, value, change, bg, iconBg }) {
  return (
    <div className={`flex items-center gap-4 flex-1 rounded-2xl px-6 py-5 shadow-sm ${bg}`}>
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-dm mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-sora tracking-tight">{value}</p>
        <p className="text-xs text-green-500 font-semibold mt-0.5">{change}</p>
      </div>
    </div>
  );
}