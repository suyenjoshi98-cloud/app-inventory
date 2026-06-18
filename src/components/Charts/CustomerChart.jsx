import { useState, useEffect } from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function CustomerChart() {
  const [period, setPeriod] = useState("This Year");
  const [chartData, setChartData] = useState([]);
  const [counts, setCounts] = useState({
    firstTime: 0,
    returning: 0,
    vip: 0,
    total: 0,
  });

  useEffect(() => {
    const customers = JSON.parse(localStorage.getItem("customers")) || [];

    const now = new Date();
    const filtered = customers.filter((c) => {
      // filter by period if customer has a date, otherwise include all
      return true;
    });

    const firstTime = filtered.filter((c) => c.type === "First Time").length;
    const returning = filtered.filter((c) => c.type === "Return").length;
    const vip = filtered.filter((c) => c.type === "VIP").length;
    const total = filtered.length || 1; // avoid divide by zero

    const data = [
      {
        name: "First Time",
        value: Math.round((firstTime / total) * 100) || 0,
        color: "#22c55e",
      },
      {
        name: "Return",
        value: Math.round((returning / total) * 100) || 0,
        color: "#f59e0b",
      },
      {
        name: "VIP",
        value: Math.round((vip / total) * 100) || 0,
        color: "#6366f1",
      },
      {
        name: "Other",
        value: Math.max(
          0,
          100 -
            Math.round((firstTime / total) * 100) -
            Math.round((returning / total) * 100) -
            Math.round((vip / total) * 100),
        ),
        color: "#e5e7eb",
      },
    ].filter((d) => d.value > 0);

    setChartData(data);
    setCounts({ firstTime, returning, vip, total: filtered.length });
  }, [period]);

  const hasData = counts.total > 0;

  return (
    <div
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      style={{ minWidth: 280 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-bold text-gray-900 font-sora">
          Overall Information
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white cursor-pointer outline-none"
        >
          <option>This Year</option>
          <option>Last Year</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      <p className="text-sm font-semibold text-gray-500 mb-4">
        Customers Overview
      </p>

      {!hasData ? (
        <div className="flex items-center justify-center h-[120px] text-gray-300 text-sm">
          No customers yet. Add customers to see the chart.
        </div>
      ) : (
        <>
          {/* Donut + Stats */}
          <div className="flex items-center gap-5">
            <PieChart width={120} height={120}>
              <Pie
                data={chartData}
                innerRadius={38}
                outerRadius={55}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>

            <div className="flex gap-4 flex-wrap">
              {[
                {
                  count: counts.firstTime,
                  label: "First Time",
                  color: "bg-green-100 text-green-500",
                },
                {
                  count: counts.returning,
                  label: "Return",
                  color: "bg-yellow-100 text-yellow-500",
                },
                {
                  count: counts.vip,
                  label: "VIP",
                  color: "bg-indigo-100 text-indigo-500",
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xl font-bold text-gray-900 font-sora">
                    {item.count}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-md ${item.color}`}
                  >
                    {counts.total > 0
                      ? Math.round((item.count / counts.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 space-y-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-sm text-gray-500 flex-1">{d.name}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
