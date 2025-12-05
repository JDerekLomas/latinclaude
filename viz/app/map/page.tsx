"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
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

interface CityData {
  place: string;
  lat: number;
  lng: number;
  cumulativeTotal: number;  // Total works up to current year (for size)
  yearlyCount: number;      // Works this specific year
  yearlyPercent: number;    // This year's output as % of total output this year (for brightness)
}

const INITIAL_VIEW_STATE = {
  longitude: 10,
  latitude: 50,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

// Base violet color - opacity based on yearly activity
function getColor(yearlyPercent: number): [number, number, number, number] {
  // yearlyPercent is 0-100, map to opacity 40-255
  const minOpacity = 40;
  const maxOpacity = 255;
  const opacity = Math.min(maxOpacity, minOpacity + (yearlyPercent * 8));
  return [139, 92, 246, opacity]; // violet with variable opacity
}

// Size based on cumulative total
function getRadius(cumulativeTotal: number): number {
  return Math.sqrt(cumulativeTotal) * 600;
}

export default function PrintingMap() {
  const [data, setData] = useState<PrintingData[]>([]);
  const [year, setYear] = useState(1470);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);

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

  // Compute city data: cumulative totals and yearly percentages
  const cityData = useMemo(() => {
    if (data.length === 0) return [];

    // Calculate cumulative totals up to current year
    const cumulativeTotals: Record<string, { total: number; lat: number; lng: number }> = {};
    const yearlyTotals: Record<string, number> = {};
    let totalThisYear = 0;

    for (const d of data) {
      if (d.year <= year) {
        if (!cumulativeTotals[d.place]) {
          cumulativeTotals[d.place] = { total: 0, lat: d.lat, lng: d.lng };
        }
        cumulativeTotals[d.place].total += d.count;
      }
      if (d.year === year) {
        yearlyTotals[d.place] = (yearlyTotals[d.place] || 0) + d.count;
        totalThisYear += d.count;
      }
    }

    // Build city data array
    const cities: CityData[] = [];
    for (const [place, info] of Object.entries(cumulativeTotals)) {
      const yearlyCount = yearlyTotals[place] || 0;
      const yearlyPercent = totalThisYear > 0 ? (yearlyCount / totalThisYear) * 100 : 0;

      cities.push({
        place,
        lat: info.lat,
        lng: info.lng,
        cumulativeTotal: info.total,
        yearlyCount,
        yearlyPercent,
      });
    }

    return cities;
  }, [data, year]);

  // Calculate stats for current view
  const totalWorksThisYear = cityData.reduce((sum, d) => sum + d.yearlyCount, 0);
  const totalWorksCumulative = cityData.reduce((sum, d) => sum + d.cumulativeTotal, 0);
  const activeCitiesThisYear = cityData.filter(d => d.yearlyCount > 0).length;
  const totalCities = cityData.length;

  // Top cities by cumulative total
  const topCitiesCumulative = [...cityData]
    .sort((a, b) => b.cumulativeTotal - a.cumulativeTotal)
    .slice(0, 5);

  // Top cities this year
  const topCitiesThisYear = [...cityData]
    .filter(d => d.yearlyCount > 0)
    .sort((a, b) => b.yearlyCount - a.yearlyCount)
    .slice(0, 5);

  const layers = [
    new ScatterplotLayer({
      id: "printing-centers",
      data: cityData,
      pickable: true,
      opacity: 1,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 4,
      radiusMaxPixels: 120,
      lineWidthMinPixels: 1,
      getPosition: (d: CityData) => [d.lng, d.lat],
      getRadius: (d: CityData) => getRadius(d.cumulativeTotal),
      getFillColor: (d: CityData) => getColor(d.yearlyPercent),
      getLineColor: (d: CityData) => d.yearlyCount > 0 ? [255, 255, 255, 150] : [255, 255, 255, 30],
      updateTriggers: {
        getFillColor: [year],
        getLineColor: [year],
        getRadius: [year],
      },
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
          getTooltip={({ object }: { object?: CityData }) => {
            if (!object) return null;
            return {
              html: `<div style="padding: 8px; background: #1e293b; border-radius: 4px; min-width: 150px;">
                <strong style="font-size: 14px;">${object.place}</strong><br/>
                <div style="margin-top: 6px; font-size: 12px;">
                  <div style="color: #a78bfa;">This year: ${object.yearlyCount.toLocaleString()} works</div>
                  <div style="color: #94a3b8;">Total to date: ${object.cumulativeTotal.toLocaleString()}</div>
                  ${object.yearlyPercent > 0 ? `<div style="color: #6ee7b7;">${object.yearlyPercent.toFixed(1)}% of ${year} output</div>` : ''}
                </div>
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
          <div className="text-slate-400 text-sm mt-2">
            <div>{totalWorksThisYear.toLocaleString()} works this year</div>
            <div className="text-slate-500">{activeCitiesThisYear} active cities</div>
          </div>
          <div className="text-slate-500 text-xs mt-2 pt-2 border-t border-slate-700">
            {totalWorksCumulative.toLocaleString()} total works
            <br />{totalCities} cities to date
          </div>
        </div>

        {/* Top cities panels */}
        <div className="absolute top-4 right-4 bg-slate-900/90 rounded-xl p-4 backdrop-blur min-w-[220px]">
          <div className="text-sm font-semibold text-violet-400 mb-2">
            Top This Year ({year})
          </div>
          {topCitiesThisYear.length > 0 ? (
            topCitiesThisYear.map((city, i) => (
              <div key={city.place} className="flex justify-between text-sm py-1">
                <span className="text-slate-300">
                  {i + 1}. {city.place}
                </span>
                <span className="text-violet-400 font-mono">
                  {city.yearlyCount.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm">No data for this year</div>
          )}

          <div className="text-sm font-semibold text-slate-400 mt-4 mb-2 pt-3 border-t border-slate-700">
            Cumulative Leaders
          </div>
          {topCitiesCumulative.map((city, i) => (
            <div key={city.place} className="flex justify-between text-sm py-1">
              <span className="text-slate-400">
                {i + 1}. {city.place}
              </span>
              <span className="text-slate-500 font-mono">
                {city.cumulativeTotal.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 right-4 bg-slate-900/90 rounded-xl p-4 backdrop-blur">
          <div className="text-sm font-semibold text-slate-400 mb-2">
            How to Read
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }}></div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }}></div>
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 0.2)" }}></div>
              </div>
              <span>Size = cumulative total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 0.3)" }}></div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 0.6)" }}></div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "rgba(139, 92, 246, 1)" }}></div>
              </div>
              <span>Brightness = yearly share</span>
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
