
import { useNavigate } from "react-router-dom";

export default function MetricCard({
  value,
  label,
  change,
  positive,
  icon,
  path,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-white rounded-2xl px-7 py-6 shadow-sm border border-gray-100 flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold text-gray-900 font-sora tracking-tight">
            {value}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        </div>
        <span className="text-2xl opacity-70">{icon}</span>
      </div>
      <div className="flex justify-between items-center mt-6">
        <span
          className={`text-sm font-semibold ${positive ? "text-green-500" : "text-[#e8533a]"}`}
        >
          {change}
        </span>
        <span
          onClick={() => path && navigate(path)}
          className="text-sm text-[#e8533a] cursor-pointer border-b border-[#e8533a] hover:opacity-70 transition-opacity"
        >
          View
        </span>
      </div>
    </div>
  );
}
