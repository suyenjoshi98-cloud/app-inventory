import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { salesData } from "../../data/dashboardData";

export default function SalesChart() {
  const [period, setPeriod] = useState("This Year");

  return (
    <div
      className="bg-white rounded-2xl p-6 flex-1 border border-gray-100 shadow-sm"
      style={{ minWidth: 0 }}
    >
      
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-bold text-gray-900 font-sora">
          Sales vs Purchase
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white cursor-pointer outline-none"
        >
          <option>This Year</option>
          <option>Last Year</option>
          <option>Last 6 Months</option>
          <option>Last week</option>
        </select>
      </div>

      
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={salesData} barSize={8} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f5f5f5"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#aaa" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#aaa" }}
            tickFormatter={(v) => `${v / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: 12,
            }}
            formatter={(v) => [`$${(v / 1000).toFixed(0)}K`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar
            dataKey="sales"
            fill="#e8533a"
            radius={[4, 4, 0, 0]}
            name="Sales"
          />
          <Bar
            dataKey="purchase"
            fill="#fca99a"
            radius={[4, 4, 0, 0]}
            name="Purchase"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

