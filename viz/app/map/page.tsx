"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Map from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

interface PrintingData {
  year: number;
  place: string;
  count: number;
  lat: number;
  lng: number;
}

const INITIAL_VIEW_STATE = {
  longitude: 10,
  latitude: 50,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

// Color scale based on output volume
function getColor(count: number): [number, number, number, number] {
  if (count > 500) return [139, 92, 246, 220]; // violet - major center
  if (count > 200) return [6, 182, 212, 200];  // cyan
  if (count > 100) return [16, 185, 129, 180]; // emerald
  if (count > 50) return [245, 158, 11, 160];  // amber
  return [248, 113, 113, 140];                  // red - smaller
}

// Size based on output
function getRadius(count: number): number {
  return Math.sqrt(count) * 800;
}

export default function PrintingMap() {
  const [data, setData] = useState<PrintingData[]>([]);
  const [year, setYear] = useState(1470);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [cumulative, setCumulative] = useState(false);

  // Load data
  useEffect(() => {
    fetch("/printing_map_data.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setYear((y) => {
        if (y >= 1700) {
          setIsPlaying(false);
          return 1700;
        }
        return y + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Filter data for current year
  const filteredData = cumulative
    ? data.filter((d) => d.year <= year)
    : data.filter((d) => d.year === year);

  // Aggregate by city for cumulative view
  const aggregatedData = cumulative
    ? Object.values(
        filteredData.reduce((acc, d) => {
          const key = d.place;
          if (!acc[key]) {
            acc[key] = { ...d, count: 0 };
          }
          acc[key].count += d.count;
          return acc;
        }, {} as Record<string, PrintingData>)
      )
    : filteredData;

  // Calculate stats for current view
  const totalWorks = aggregatedData.reduce((sum, d) => sum + d.count, 0);
  const activeCities = new Set(aggregatedData.map((d) => d.place)).size;

  // Top cities for current year
  const topCities = [...aggregatedData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const layers = [
    new ScatterplotLayer({
      id: "printing-centers",
      data: aggregatedData,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d: PrintingData) => [d.lng, d.lat],
      getRadius: (d: PrintingData) => getRadius(d.count),
      getFillColor: (d: PrintingData) => getColor(d.count),
      getLineColor: [255, 255, 255, 100],
    }),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 relative z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <Link href="/" className="text-violet-400 hover:underline text-sm">
            &larr; Back to visualization
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            The Spread of Latin Printing in Europe
          </h1>
        </div>
      </header>

      {/* Map container */}
      <div className="relative" style={{ height: "calc(100vh - 180px)" }}>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          getTooltip={({ object }: { object?: PrintingData }) => {
            if (!object) return null;
            return {
              html: `<div style="padding: 8px; background: #1e293b; border-radius: 4px;">
                <strong>${object.place}</strong><br/>
                ${cumulative ? "Total" : year}: ${object.count.toLocaleString()} works
              </div>`,
            };
          }}
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            attributionControl={false}
          />
        </DeckGL>

        {/* Year display overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/90 rounded-xl p-4 backdrop-blur">
          <div className="text-5xl font-bold text-violet-400">{year}</div>
          <div className="text-slate-400 text-sm mt-1">
            {totalWorks.toLocaleString()} works in {activeCities} cities
          </div>
        </div>

        {/* Top cities panel */}
        <div className="absolute top-4 right-4 bg-slate-900/90 rounded-xl p-4 backdrop-blur min-w-[200px]">
          <div className="text-sm font-semibold text-slate-400 mb-2">
            Top Centers {cumulative ? "(cumulative)" : ""}
          </div>
          {topCities.map((city, i) => (
            <div key={city.place} className="flex justify-between text-sm py-1">
              <span className="text-slate-300">
                {i + 1}. {city.place}
              </span>
              <span className="text-violet-400 font-mono">
                {city.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 right-4 bg-slate-900/90 rounded-xl p-4 backdrop-blur">
          <div className="text-sm font-semibold text-slate-400 mb-2">
            Annual Output
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgb(139, 92, 246)" }}
              ></div>
              <span className="text-slate-300">500+ works</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgb(6, 182, 212)" }}
              ></div>
              <span className="text-slate-300">200-500</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgb(16, 185, 129)" }}
              ></div>
              <span className="text-slate-300">100-200</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgb(245, 158, 11)" }}
              ></div>
              <span className="text-slate-300">50-100</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "rgb(248, 113, 113)" }}
              ></div>
              <span className="text-slate-300">&lt;50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-slate-800 bg-slate-900 px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-6">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold transition-colors"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            {/* Year slider */}
            <div className="flex-1 min-w-[300px]">
              <input
                type="range"
                min={1450}
                max={1700}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1450</span>
                <span>1500</span>
                <span>1550</span>
                <span>1600</span>
                <span>1650</span>
                <span>1700</span>
              </div>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="bg-slate-800 text-white rounded px-2 py-1 text-sm"
              >
                <option value={500}>Slow</option>
                <option value={200}>Normal</option>
                <option value={100}>Fast</option>
                <option value={50}>Very Fast</option>
              </select>
            </div>

            {/* Cumulative toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cumulative}
                onChange={(e) => setCumulative(e.target.checked)}
                className="accent-violet-500"
              />
              <span className="text-slate-300 text-sm">Cumulative</span>
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                setYear(1450);
                setIsPlaying(false);
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
