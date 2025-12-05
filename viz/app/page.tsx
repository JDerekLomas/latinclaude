"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface VizData {
  summary: {
    total_records: number;
    date_range: string;
    source: string;
  };
  years: { year: number; count: number }[];
  top_places: { place: string; count: number }[];
  top_authors: { author: string; count: number }[];
  classifications: { name: string; count: number }[];
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F",
  "#FFBB28", "#FF8042", "#0088FE", "#00C49F", "#FFBB28",
  "#a4de6c", "#d0ed57", "#ffc658", "#ff7c43", "#665191",
];

export default function Home() {
  const [data, setData] = useState<VizData | null>(null);

  useEffect(() => {
    fetch("/viz_data.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-xl">Loading Latin Bibliography Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Latin Master Bibliography</h1>
        <p className="text-slate-400 text-lg">
          {data.summary.total_records.toLocaleString()} Latin printed works (1450-1700)
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Source: {data.summary.source}
        </p>
      </header>

      {/* Publications Over Time */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Publications Over Time</h2>
        <div className="bg-slate-800 rounded-lg p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.years}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="year"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Publications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Top Printing Centers */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Top Printing Centers</h2>
          <div className="bg-slate-800 rounded-lg p-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_places.slice(0, 15)}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <YAxis
                  type="category"
                  dataKey="place"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#82ca9d" name="Works" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Subject Classifications */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Subject Classifications</h2>
          <div className="bg-slate-800 rounded-lg p-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.classifications.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => {
                    const n = name || "";
                    return `${n.slice(0, 12)}${n.length > 12 ? "..." : ""} ${((percent || 0) * 100).toFixed(0)}%`;
                  }}
                >
                  {data.classifications.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Top Authors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Most Published Authors</h2>
        <div className="bg-slate-800 rounded-lg p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_authors.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="author"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#ffc658" name="Editions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {data.summary.total_records.toLocaleString()}
          </div>
          <div className="text-slate-400 mt-2">Total Latin Works</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {data.top_places.length}+
          </div>
          <div className="text-slate-400 mt-2">Printing Centers</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400">250</div>
          <div className="text-slate-400 mt-2">Years Covered</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">
            {data.top_authors.length}+
          </div>
          <div className="text-slate-400 mt-2">Named Authors</div>
        </div>
      </section>

      <footer className="text-center text-slate-500 text-sm">
        <p>
          Data from the Universal Short Title Catalogue (USTC). Visualization by{" "}
          <a
            href="https://github.com/JDerekLomas/latinclaude"
            className="text-purple-400 hover:underline"
          >
            latinclaude
          </a>
        </p>
      </footer>
    </div>
  );
}
