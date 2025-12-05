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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface VizData {
  summary: {
    total_ustc_records: number;
    total_latin_works: number;
    latin_percentage: number;
    date_range: string;
    source: string;
  };
  latin_vs_vernacular: {
    decade: number;
    latin: number;
    vernacular: number;
    latin_pct: number;
    vernacular_pct: number;
  }[];
  languages: { language: string; count: number; pct: number }[];
  latin_by_year: { year: number; count: number }[];
  accessibility_funnel: { stage: string; count: number; pct: number }[];
  digitization: {
    total_latin_works: number;
    estimated_digitized: number;
    estimated_ocr: number;
    estimated_translated: number;
    untranslated: number;
  };
  top_places: { place: string; count: number }[];
  classifications: { name: string; count: number }[];
  key_insight: { title: string; message: string };
}

const COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-xl">Loading Latin Bibliography Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-cyan-900/20" />
        <div className="relative max-w-6xl mx-auto px-8 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            The Hidden Renaissance
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-6">
            {data.summary.total_latin_works.toLocaleString()} Latin works printed 1450–1700
          </p>
          <div className="inline-block bg-red-500/20 border border-red-500/50 rounded-lg px-6 py-4">
            <p className="text-lg text-red-300">
              <span className="font-bold text-2xl text-red-400">97%</span> have never been translated to English
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 space-y-16">

        {/* Key Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-violet-400">
              {data.summary.total_ustc_records.toLocaleString()}
            </div>
            <div className="text-slate-400 mt-2">Total Works in USTC</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-cyan-400">
              {data.summary.total_latin_works.toLocaleString()}
            </div>
            <div className="text-slate-400 mt-2">Latin Works</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-400">
              ~{Math.round(data.digitization.estimated_digitized / 1000)}K
            </div>
            <div className="text-slate-400 mt-2">Digitized Scans</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-red-400">
              ~{Math.round(data.digitization.estimated_translated / 1000)}K
            </div>
            <div className="text-slate-400 mt-2">English Translations</div>
          </div>
        </section>

        {/* Accessibility Funnel */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">The Accessibility Gap</h2>
          <p className="text-slate-400 mb-6">How much of Renaissance Latin literature can you actually read?</p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="space-y-4">
              {data.accessibility_funnel.map((item, i) => (
                <div key={item.stage} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.stage}</span>
                    <span className="text-sm text-slate-400">
                      {item.count.toLocaleString()} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        i === 0 ? 'bg-violet-600' :
                        i === 1 ? 'bg-cyan-600' :
                        i === 2 ? 'bg-amber-600' :
                        'bg-emerald-600'
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-6 italic">
              Estimates based on Internet Archive, Google Books, and HathiTrust coverage research.{" "}
              <a href="/blog/methodology" className="text-violet-400 hover:underline">
                See methodology
              </a>
            </p>
          </div>
        </section>

        {/* Latin vs Vernacular Over Time */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">The Decline of Latin</h2>
          <p className="text-slate-400 mb-6">Latin dominated early printing but steadily gave way to vernacular languages</p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.latin_vs_vernacular}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="decade"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${v}s`}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'latin_pct' ? 'Latin' : 'Vernacular'
                  ]}
                  labelFormatter={(label) => `${label}s`}
                />
                <Legend formatter={(value) => value === 'latin_pct' ? 'Latin' : 'Vernacular'} />
                <Area
                  type="monotone"
                  dataKey="latin_pct"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  name="latin_pct"
                />
                <Area
                  type="monotone"
                  dataKey="vernacular_pct"
                  stackId="1"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  name="vernacular_pct"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Language Breakdown */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Languages of Renaissance Print</h2>
          <p className="text-slate-400 mb-6">Distribution across {data.summary.total_ustc_records.toLocaleString()} printed works</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.languages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="language"
                  >
                    {data.languages.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} (${((value / data.summary.total_ustc_records) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="space-y-3">
                {data.languages.map((lang, i) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span>{lang.language}</span>
                    </div>
                    <div className="text-slate-400">
                      {lang.count.toLocaleString()} <span className="text-slate-500">({lang.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Latin Publications Timeline */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Latin Publishing Over Time</h2>
          <p className="text-slate-400 mb-6">Annual output of Latin works 1450–1700</p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.latin_by_year}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="year"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Latin works']}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fill="url(#latinGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="latinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Two Column: Places and Subjects */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Printing Centers */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Latin Printing Centers</h2>
            <p className="text-slate-400 mb-6">Where Latin books were printed</p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.top_places.slice(0, 12)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <YAxis
                    type="category"
                    dataKey="place"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Works']}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Subject Classifications */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">What Was Being Written</h2>
            <p className="text-slate-400 mb-6">Subject classifications of Latin works</p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.classifications.slice(0, 12)}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9CA3AF"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    width={95}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Works']}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <section className="text-center py-12">
          <div className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-500/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">500,000+ Works Waiting to be Discovered</h2>
            <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
              The vast majority of Renaissance intellectual output—theology, medicine, law, philosophy,
              science, poetry—remains locked in Latin, inaccessible to modern readers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a
                href="/blog"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold transition-colors"
              >
                Read the Research
              </a>
              <a
                href="/timelines"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors"
              >
                Explore Timelines
              </a>
              <a
                href="/map"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-colors"
              >
                Animated Map
              </a>
              <a
                href="https://github.com/JDerekLomas/latinclaude"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          Built with USTC data • Visualization by{" "}
          <a
            href="https://github.com/JDerekLomas/latinclaude"
            className="text-violet-400 hover:underline"
          >
            latinclaude
          </a>
        </p>
      </footer>
    </div>
  );
}
