"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

// Types
interface RiverInfo {
  color: string;
  description: string;
}

interface TimelineData {
  [year: string]: {
    [tradition: string]: number;
  };
}

interface RiversData {
  rivers: Record<string, RiverInfo>;
  timeline: TimelineData;
}

interface AnnotationEvent {
  year: number;
  title: string;
  traditions: string[];
  description?: string;
}

interface AnnotationsData {
  events: AnnotationEvent[];
}

// Sankey node/link types
interface SankeyNodeExtra {
  id: string;
  tradition: string;
  decade: number;
}

interface SankeyLinkExtra {
  source: string;
  target: string;
  value: number;
  tradition: string;
}

// River colors from the data file
const RIVER_COLORS: Record<string, string> = {
  hermetica: "#9b59b6",
  alchemy: "#f1c40f",
  mysticism: "#3498db",
  rosicrucianism: "#e74c3c",
  kabbalah: "#2ecc71",
  neoplatonism: "#1abc9c",
  magic: "#8e44ad",
  paracelsianism: "#e67e22",
  theosophy: "#34495e",
};

const RIVER_ORDER = [
  "hermetica",
  "neoplatonism",
  "kabbalah",
  "magic",
  "alchemy",
  "paracelsianism",
  "mysticism",
  "rosicrucianism",
  "theosophy",
];

export default function RiversPage() {
  const [riversData, setRiversData] = useState<RiversData | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationsData | null>(null);
  const [currentYear, setCurrentYear] = useState(1469);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(80);
  const [hoveredTradition, setHoveredTradition] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/rivers_of_life.json").then((res) => res.json()),
      fetch("/rivers_annotations.json").then((res) => res.json()),
    ]).then(([rivers, annots]) => {
      setRiversData(rivers);
      setAnnotations(annots);
    });
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 280, 1100);
      const height = Math.min(window.innerHeight - 280, 650);
      setDimensions({ width: Math.max(600, width), height: Math.max(400, height) });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentYear((y) => {
        if (y >= 1750) {
          setIsPlaying(false);
          return 1750;
        }
        return y + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Get current decade
  const currentDecade = Math.floor(currentYear / 10) * 10;

  // Transform data for Sankey visualization
  const sankeyData = useMemo(() => {
    if (!riversData) return null;

    const { timeline } = riversData;
    const years = Object.keys(timeline).map(Number).sort((a, b) => a - b);

    // Group by decade
    const decades: number[] = [];
    for (let d = 1460; d <= 1750; d += 10) {
      decades.push(d);
    }

    // Calculate totals per decade per tradition
    const decadeTotals: Record<number, Record<string, number>> = {};
    for (const decade of decades) {
      decadeTotals[decade] = {};
      for (const tradition of RIVER_ORDER) {
        decadeTotals[decade][tradition] = 0;
      }
    }

    for (const year of years) {
      const decade = Math.floor(year / 10) * 10;
      if (decade < 1460 || decade > 1750) continue;
      const yearData = timeline[year.toString()];
      if (!yearData) continue;
      for (const [tradition, count] of Object.entries(yearData)) {
        if (decadeTotals[decade][tradition] !== undefined) {
          decadeTotals[decade][tradition] += count;
        }
      }
    }

    // Build nodes and links
    const nodes: SankeyNodeExtra[] = [];
    const links: SankeyLinkExtra[] = [];
    const nodeMap: Record<string, number> = {};

    // Create nodes for each tradition at each decade
    let nodeIndex = 0;
    for (const decade of decades) {
      for (const tradition of RIVER_ORDER) {
        const id = `${tradition}-${decade}`;
        nodes.push({ id, tradition, decade });
        nodeMap[id] = nodeIndex++;
      }
    }

    // Create links between consecutive decades
    for (let i = 0; i < decades.length - 1; i++) {
      const fromDecade = decades[i];
      const toDecade = decades[i + 1];

      for (const tradition of RIVER_ORDER) {
        const value = Math.max(1, decadeTotals[fromDecade][tradition]);
        links.push({
          source: `${tradition}-${fromDecade}`,
          target: `${tradition}-${toDecade}`,
          value,
          tradition,
        });
      }
    }

    return { nodes, links, nodeMap, decades, decadeTotals };
  }, [riversData]);

  // Generate Sankey layout
  const sankeyLayout = useMemo(() => {
    if (!sankeyData) return null;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };

    // Custom Sankey generator - we'll do horizontal time flow
    const sankeyGen = sankey<SankeyNodeExtra, SankeyLinkExtra>()
      .nodeWidth(8)
      .nodePadding(4)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .nodeId((d) => d.id);

    // Convert to format d3-sankey expects
    const graph = {
      nodes: sankeyData.nodes.map((n) => ({ ...n })),
      links: sankeyData.links.map((l) => ({
        ...l,
        source: l.source,
        target: l.target,
      })),
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layout = sankeyGen(graph as any);
      return layout;
    } catch (e) {
      console.error("Sankey layout error:", e);
      return null;
    }
  }, [sankeyData, dimensions]);

  // Get visible events up to current year
  const visibleEvents = useMemo(() => {
    if (!annotations) return [];
    return annotations.events
      .filter((e) => e.year <= currentYear)
      .sort((a, b) => b.year - a.year); // Most recent first
  }, [annotations, currentYear]);

  // Stats for current year
  const currentStats = useMemo(() => {
    if (!riversData || !sankeyData) return null;
    const decadeTotals = sankeyData.decadeTotals[currentDecade] || {};
    const total = Object.values(decadeTotals).reduce((s, v) => s + v, 0);
    const topTraditions = Object.entries(decadeTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return { total, topTraditions, decade: currentDecade };
  }, [riversData, sankeyData, currentDecade]);

  // Render link path
  const renderLink = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any, index: number) => {
      const path = sankeyLinkHorizontal()(link);
      if (!path) return null;

      const tradition = link.tradition || link.source?.tradition;
      const color = RIVER_COLORS[tradition] || "#999";
      const targetDecade = link.target?.decade || 0;
      const isVisible = targetDecade <= currentDecade;
      const isHovered = hoveredTradition === tradition;
      const opacity = isVisible ? (isHovered || !hoveredTradition ? 0.7 : 0.15) : 0.05;

      return (
        <path
          key={index}
          d={path}
          fill={color}
          fillOpacity={opacity}
          stroke={color}
          strokeOpacity={isVisible ? 0.3 : 0}
          strokeWidth={0.5}
          style={{
            transition: "fill-opacity 0.3s, stroke-opacity 0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoveredTradition(tradition)}
          onMouseLeave={() => setHoveredTradition(null)}
        />
      );
    },
    [currentDecade, hoveredTradition]
  );

  if (!riversData || !annotations || !sankeyLayout) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdfcf9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#666", fontFamily: "Inter, sans-serif" }}>
          Loading rivers...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdfcf9" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #e8e4dc",
          padding: "16px 24px",
          marginTop: "64px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link
              href="/blog"
              style={{
                color: "#9e4a3a",
                fontSize: "13px",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
              }}
            >
              &larr; Back to Essays
            </Link>
            <Link
              href="/rivers/static"
              style={{
                color: "#666",
                fontSize: "13px",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
              }}
            >
              View static version
            </Link>
          </div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "36px",
              fontWeight: 600,
              color: "#1a1612",
              marginTop: "8px",
              marginBottom: "4px",
            }}
          >
            Rivers of Esoteric Life
          </h1>
          <p
            style={{
              fontFamily: "Newsreader, Georgia, serif",
              fontSize: "18px",
              color: "#666",
              margin: 0,
            }}
          >
            Mapping 280 years of occult publishing (1469-1750)
          </p>
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px",
          display: "flex",
          gap: "24px",
        }}
      >
        {/* Timeline sidebar */}
        <div
          style={{
            width: "220px",
            flexShrink: 0,
            borderRight: "1px solid #e8e4dc",
            paddingRight: "24px",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#888",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Timeline
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "calc(100vh - 400px)",
              overflowY: "auto",
            }}
          >
            {visibleEvents.map((event, i) => (
              <div
                key={i}
                style={{
                  opacity: event.year === currentYear ? 1 : 0.7,
                  transition: "opacity 0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Monaco, Courier, monospace",
                      fontSize: "12px",
                      color: "#9e4a3a",
                      flexShrink: 0,
                      width: "36px",
                    }}
                  >
                    {event.year}
                  </span>
                  <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                    {event.traditions.length > 0 ? (
                      event.traditions.slice(0, 2).map((t) => (
                        <div
                          key={t}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "2px",
                            backgroundColor: RIVER_COLORS[t] || "#999",
                          }}
                        />
                      ))
                    ) : (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "2px",
                          backgroundColor: "#ccc",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Newsreader, Georgia, serif",
                    fontSize: "13px",
                    color: "#444",
                    marginTop: "4px",
                    marginLeft: "44px",
                    lineHeight: 1.4,
                  }}
                >
                  {event.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main visualization */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Year display */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "64px",
                fontWeight: 600,
                color: "#9e4a3a",
                lineHeight: 1,
              }}
            >
              {currentYear}
            </span>
            {currentStats && (
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#666" }}>
                <span style={{ fontWeight: 500 }}>{currentStats.total}</span> works this decade
                {currentStats.topTraditions.length > 0 && (
                  <span style={{ color: "#999", marginLeft: "8px" }}>
                    Top:{" "}
                    {currentStats.topTraditions
                      .map(([t]) => t.charAt(0).toUpperCase() + t.slice(1))
                      .join(", ")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sankey chart */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e4dc",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <svg width={dimensions.width} height={dimensions.height}>
              {/* Decade labels at bottom */}
              {sankeyData?.decades
                .filter((d) => d % 50 === 0)
                .map((decade) => {
                  const x =
                    ((decade - 1460) / (1750 - 1460)) *
                      (dimensions.width - 40) +
                    20;
                  return (
                    <text
                      key={decade}
                      x={x}
                      y={dimensions.height - 10}
                      textAnchor="middle"
                      style={{
                        fontFamily: "Monaco, Courier, monospace",
                        fontSize: "11px",
                        fill: "#999",
                      }}
                    >
                      {decade}
                    </text>
                  );
                })}

              {/* Current year indicator */}
              <line
                x1={
                  ((currentYear - 1460) / (1750 - 1460)) *
                    (dimensions.width - 40) +
                  20
                }
                y1={10}
                x2={
                  ((currentYear - 1460) / (1750 - 1460)) *
                    (dimensions.width - 40) +
                  20
                }
                y2={dimensions.height - 30}
                stroke="#9e4a3a"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
              />

              {/* Links (rivers) */}
              <g>
                {sankeyLayout.links.map((link, i) => renderLink(link, i))}
              </g>
            </svg>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "16px",
              padding: "12px 16px",
              background: "#f5f0e8",
              borderRadius: "8px",
            }}
          >
            {RIVER_ORDER.map((tradition) => (
              <div
                key={tradition}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  opacity: hoveredTradition === tradition || !hoveredTradition ? 1 : 0.4,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={() => setHoveredTradition(tradition)}
                onMouseLeave={() => setHoveredTradition(null)}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    backgroundColor: RIVER_COLORS[tradition],
                  }}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    color: "#444",
                    textTransform: "capitalize",
                  }}
                >
                  {tradition}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(253, 252, 249, 0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #e8e4dc",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "10px 24px",
              background: "#9e4a3a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Year slider */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="range"
              min={1469}
              max={1750}
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#9e4a3a" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Monaco, Courier, monospace",
                fontSize: "11px",
                color: "#999",
                marginTop: "4px",
              }}
            >
              <span>1469</span>
              <span>1550</span>
              <span>1650</span>
              <span>1750</span>
            </div>
          </div>

          {/* Speed */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#666",
              }}
            >
              Speed:
            </span>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              style={{
                padding: "6px 12px",
                border: "1px solid #e8e4dc",
                borderRadius: "4px",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              <option value={200}>Slow</option>
              <option value={80}>Normal</option>
              <option value={40}>Fast</option>
              <option value={20}>Very Fast</option>
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setCurrentYear(1469);
              setIsPlaying(false);
            }}
            style={{
              padding: "10px 16px",
              background: "#e8e4dc",
              color: "#444",
              border: "none",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
