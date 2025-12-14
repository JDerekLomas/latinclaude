"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

// Types
interface TimelineData {
  [year: string]: {
    [tradition: string]: number;
  };
}

interface RiversData {
  rivers: Record<string, { color: string; description: string }>;
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

interface BPHBook {
  id: number;
  title: string;
  author: string;
  year: number;
  place: string;
  keywords?: string;
  ia_url?: string;
}

// River colors
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

const RIVER_LABELS: Record<string, string> = {
  hermetica: "Hermetica",
  neoplatonism: "Neoplatonism",
  kabbalah: "Kabbalah",
  magic: "Magic",
  alchemy: "Alchemy",
  paracelsianism: "Paracelsianism",
  mysticism: "Mysticism",
  rosicrucianism: "Rosicrucianism",
  theosophy: "Theosophy",
};

// Historical context for each era
const ERA_CONTEXT: Record<number, { era: string; notes: string[] }> = {
  1460: { era: "Early Renaissance", notes: ["Gutenberg Bible (1455)", "Fall of Constantinople disperses Greek scholars"] },
  1470: { era: "Florentine Golden Age", notes: ["Lorenzo de' Medici rules Florence", "Platonic Academy flourishes"] },
  1480: { era: "Humanist Expansion", notes: ["Botticelli paints Primavera", "Incunabula period peaks"] },
  1490: { era: "Age of Discovery", notes: ["Columbus reaches Americas (1492)", "Aldine Press founded in Venice"] },
  1500: { era: "High Renaissance", notes: ["Leonardo, Michelangelo, Raphael active", "Erasmus publishes Adagia"] },
  1510: { era: "Reform Stirrings", notes: ["Luther's 95 Theses (1517)", "Reuchlin controversy"] },
  1520: { era: "Reformation Spreads", notes: ["Diet of Worms (1521)", "Peasants' War in Germany"] },
  1530: { era: "Religious Division", notes: ["Henry VIII breaks with Rome", "Calvin arrives in Geneva"] },
  1540: { era: "Counter-Reformation", notes: ["Council of Trent (1545)", "Jesuits founded (1540)"] },
  1550: { era: "Confessional Age", notes: ["Peace of Augsburg (1555)", "Index of Forbidden Books"] },
  1560: { era: "Religious Wars", notes: ["French Wars of Religion", "Dutch Revolt against Spain"] },
  1570: { era: "Late Renaissance", notes: ["St. Bartholomew's Massacre (1572)", "Tycho Brahe's supernova"] },
  1580: { era: "Age of Anxiety", notes: ["Spanish Armada (1588)", "Bruno travels Europe"] },
  1590: { era: "Fin de Siècle", notes: ["Shakespeare's major plays", "Kepler's Mysterium"] },
  1600: { era: "Scientific Revolution", notes: ["Bruno burned (1600)", "Gilbert's De Magnete"] },
  1610: { era: "Rosicrucian Furor", notes: ["Galileo's telescope", "Manifestos electrify Europe"] },
  1620: { era: "Thirty Years War", notes: ["War devastates Europe", "Bacon's Novum Organum"] },
  1630: { era: "War & Displacement", notes: ["Descartes in Amsterdam", "Swedish intervention"] },
  1640: { era: "English Revolution", notes: ["Civil War in England", "Westphalia negotiations"] },
  1650: { era: "Interregnum", notes: ["Commonwealth in England", "Hobbes' Leviathan (1651)"] },
  1660: { era: "Restoration Era", notes: ["Royal Society (1660)", "Great Fire of London"] },
  1670: { era: "Late Baroque", notes: ["Spinoza's Ethics (1677)", "Newton's optics"] },
  1680: { era: "Glorious Revolution", notes: ["William & Mary (1688)", "Newton's Principia"] },
  1690: { era: "Early Enlightenment", notes: ["Locke's Essay (1690)", "Salem witch trials"] },
  1700: { era: "Dawn of Enlightenment", notes: ["War of Spanish Succession", "Act of Union (1707)"] },
  1710: { era: "Augustan Age", notes: ["Pope's Rape of the Lock", "Leibniz-Newton dispute"] },
  1720: { era: "Early Georgian", notes: ["South Sea Bubble (1720)", "Bach's Brandenburg"] },
  1730: { era: "Pietist Revival", notes: ["Zinzendorf and Moravians", "Voltaire's Letters"] },
  1740: { era: "Austrian Succession", notes: ["Frederick the Great", "Handel's Messiah (1741)"] },
  1750: { era: "High Enlightenment", notes: ["Encyclopédie (1751)", "Lisbon earthquake"] },
};

const START_YEAR = 1460;
const END_YEAR = 1760;
const ROW_HEIGHT = 70; // pixels per decade

export default function RiversStaticPage() {
  const [riversData, setRiversData] = useState<RiversData | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationsData | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [books, setBooks] = useState<BPHBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Load data
  useEffect(() => {
    Promise.all([
      fetch("/rivers_of_life.json").then((res) => res.json()),
      fetch("/rivers_annotations.json").then((res) => res.json()),
    ])
      .then(([rivers, annots]) => {
        setRiversData(rivers);
        setAnnotations(annots);
      })
      .catch((err) => {
        console.error("Failed to load rivers data:", err);
      });
  }, []);

  // Fetch books when a decade is selected
  useEffect(() => {
    if (selectedDecade === null) {
      setBooks([]);
      return;
    }

    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch(
          `/api/bph/catalog?yearMin=${selectedDecade}&yearMax=${selectedDecade + 9}&limit=50`
        );
        const data = await res.json();
        setBooks(data.items || []);
      } catch (err) {
        console.error("Failed to fetch books:", err);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selectedDecade]);

  // Process decade data with totals
  const decadeData = useMemo(() => {
    if (!riversData) return null;

    const { timeline } = riversData;
    const years = Object.keys(timeline).map(Number).sort((a, b) => a - b);

    const decades: { decade: number; totals: Record<string, number>; total: number }[] = [];
    let maxTotal = 0;

    for (let d = START_YEAR; d < END_YEAR; d += 10) {
      const totals: Record<string, number> = {};
      for (const tradition of RIVER_ORDER) {
        totals[tradition] = 0;
      }

      for (const year of years) {
        if (year >= d && year < d + 10) {
          const yearData = timeline[year.toString()];
          if (yearData) {
            for (const [tradition, count] of Object.entries(yearData)) {
              if (totals[tradition] !== undefined) {
                totals[tradition] += count;
              }
            }
          }
        }
      }

      const total = Object.values(totals).reduce((s, v) => s + v, 0);
      if (total > maxTotal) maxTotal = total;
      decades.push({ decade: d, totals, total });
    }

    return { decades, maxTotal };
  }, [riversData]);

  // Get annotations indexed by decade
  const annotationsByDecade = useMemo(() => {
    if (!annotations) return {};
    const byDecade: Record<number, AnnotationEvent[]> = {};
    for (const event of annotations.events) {
      const decade = Math.floor(event.year / 10) * 10;
      if (!byDecade[decade]) byDecade[decade] = [];
      byDecade[decade].push(event);
    }
    return byDecade;
  }, [annotations]);

  // Generate stacked area paths for each tradition
  const stackedPaths = useMemo(() => {
    if (!decadeData) return [];

    const { decades, maxTotal } = decadeData;
    const chartWidth = 200;
    const paths: { tradition: string; color: string; path: string }[] = [];

    // For each tradition, we need to calculate cumulative positions
    // Going in reverse order so first traditions are at the bottom (left side of horizontal chart)
    const traditionsReversed = [...RIVER_ORDER].reverse();

    traditionsReversed.forEach((tradition) => {
      const points: { x: number; y: number }[] = [];
      const basePoints: { x: number; y: number }[] = [];

      decades.forEach((d, i) => {
        const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Calculate cumulative x position for this tradition
        let cumulative = 0;
        for (const t of traditionsReversed) {
          if (t === tradition) break;
          cumulative += d.totals[t] || 0;
        }

        const baseX = (cumulative / maxTotal) * chartWidth;
        const topX = ((cumulative + (d.totals[tradition] || 0)) / maxTotal) * chartWidth;

        basePoints.push({ x: baseX, y });
        points.push({ x: topX, y });
      });

      // Build path: go down the right edge, then back up the left edge
      let path = `M ${points[0].x} ${points[0].y}`;

      // Right edge (with curves)
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpY = (prev.y + curr.y) / 2;
        path += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
      }

      // Connect to base at bottom
      const lastBase = basePoints[basePoints.length - 1];
      path += ` L ${lastBase.x} ${lastBase.y}`;

      // Left edge going back up (with curves)
      for (let i = basePoints.length - 2; i >= 0; i--) {
        const prev = basePoints[i + 1];
        const curr = basePoints[i];
        const cpY = (prev.y + curr.y) / 2;
        path += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
      }

      path += " Z";

      paths.push({
        tradition,
        color: RIVER_COLORS[tradition],
        path,
      });
    });

    return paths.reverse(); // Reverse so first traditions render first (at bottom)
  }, [decadeData]);

  if (!riversData || !annotations || !decadeData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fdfcf9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "64px",
        }}
      >
        <div style={{ color: "#666", fontFamily: "Inter, sans-serif" }}>
          Loading rivers...
        </div>
      </div>
    );
  }

  const { decades, maxTotal } = decadeData;
  const chartHeight = decades.length * ROW_HEIGHT;

  return (
    <div style={{ minHeight: "100vh", background: "#fdfcf9" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #e8e4dc",
          padding: "16px 24px",
          marginTop: "64px",
          position: "sticky",
          top: "64px",
          background: "#fdfcf9",
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Link
                href="/rivers"
                style={{ color: "#9e4a3a", fontSize: "13px", textDecoration: "none", fontFamily: "Inter" }}
              >
                ← Animated version
              </Link>
              <h1
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#1a1612",
                  marginTop: "8px",
                  marginBottom: "4px",
                }}
              >
                Rivers of Esoteric Life
              </h1>
              <p style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: "15px", color: "#666", margin: 0 }}>
                Publication volume across 300 years of esoteric printing
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "500px", justifyContent: "flex-end" }}>
              {RIVER_ORDER.map((tradition) => (
                <div key={tradition} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "2px",
                      backgroundColor: RIVER_COLORS[tradition],
                    }}
                  />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#555" }}>
                    {RIVER_LABELS[tradition]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Books Modal */}
      {selectedDecade !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setSelectedDecade(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", margin: 0, color: "#1a1612" }}>
                  {selectedDecade}s
                </h2>
                <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#666", margin: "4px 0 0 0" }}>
                  {ERA_CONTEXT[selectedDecade]?.era || ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedDecade(null)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#999" }}
              >
                ×
              </button>
            </div>

            {loadingBooks ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>Loading books...</div>
            ) : books.length === 0 ? (
              <p style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#666" }}>
                No books found in the BPH catalog for this decade.
              </p>
            ) : (
              <>
                <p style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                  {books.length} work{books.length !== 1 ? "s" : ""} from the BPH catalog:
                </p>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {books.map((book) => {
                    const tradition = book.keywords?.toLowerCase() || "";
                    const color = RIVER_COLORS[tradition] || "#888";
                    const label = RIVER_LABELS[tradition] || tradition;
                    return (
                      <div key={book.id} style={{ padding: "10px 0", borderBottom: "1px solid #f0ebe3", display: "flex", gap: "12px" }}>
                        {/* Tradition tag */}
                        <div style={{ flexShrink: 0, width: "90px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: color + "20",
                            border: `1px solid ${color}40`,
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "2px", backgroundColor: color }} />
                            <span style={{ fontFamily: "Inter", fontSize: "10px", fontWeight: 500, color }}>{label}</span>
                          </span>
                        </div>
                        {/* Book info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#1a1612", marginBottom: "2px" }}>
                            <em>{book.title}</em>
                          </div>
                          <div style={{ fontFamily: "Inter", fontSize: "12px", color: "#666" }}>
                            {book.author && <span>{book.author} · </span>}
                            {book.place && <span>{book.place}, </span>}
                            <span>{book.year}</span>
                            {book.ia_url && (
                              <a href={book.ia_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "8px", color: "#9e4a3a" }}>
                                View on IA →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content - 3 columns with continuous vertical chart */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 1fr", gap: "0" }}>

          {/* Left: Esoteric events timeline */}
          <div style={{ borderRight: "1px solid #e8e4dc", paddingRight: "24px" }}>
            <div style={{ fontFamily: "Inter", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #e8e4dc" }}>
              Esoteric Publishing Events
            </div>
            {decades.map(({ decade, total }) => {
              const events = annotationsByDecade[decade] || [];
              return (
                <div
                  key={decade}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    paddingTop: "8px",
                    borderBottom: "1px solid #f5f0e8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Cormorant Garamond", fontSize: "18px", fontWeight: 600, color: "#9e4a3a" }}>
                      {decade}s
                    </span>
                    <span style={{ fontFamily: "Monaco, monospace", fontSize: "10px", color: "#999" }}>
                      {total} works
                    </span>
                  </div>
                  {events.slice(0, 2).map((event, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "5px", marginBottom: "2px" }}>
                      <div style={{ display: "flex", gap: "2px", flexShrink: 0, marginTop: "3px" }}>
                        {event.traditions.slice(0, 2).map((t) => (
                          <div key={t} style={{ width: "4px", height: "4px", borderRadius: "1px", backgroundColor: RIVER_COLORS[t] || "#ccc" }} />
                        ))}
                        {event.traditions.length === 0 && <div style={{ width: "4px", height: "4px", borderRadius: "1px", backgroundColor: "#bbb" }} />}
                      </div>
                      <span style={{ fontFamily: "Newsreader", fontSize: "11px", color: "#444", lineHeight: 1.3 }}>
                        <strong style={{ color: "#666" }}>{event.year}</strong> {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Center: Stacked area chart showing all traditions */}
          <div style={{ position: "relative", background: "#f8f6f2" }}>
            <div style={{ fontFamily: "Inter", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #e8e4dc", textAlign: "center", background: "#fdfcf9", marginLeft: "-1px", marginRight: "-1px", paddingLeft: "8px", paddingRight: "8px" }}>
              Rivers
            </div>
            <svg
              width="220"
              height={chartHeight}
              style={{ display: "block" }}
            >
              {/* Grid lines */}
              {decades.map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * ROW_HEIGHT}
                  x2="220"
                  y2={i * ROW_HEIGHT}
                  stroke="#ddd8d0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Stacked area fills for each tradition */}
              {stackedPaths.map(({ tradition, color, path }) => (
                <path
                  key={tradition}
                  d={path}
                  fill={color}
                  opacity="0.85"
                  stroke={color}
                  strokeWidth="0.5"
                />
              ))}

              {/* Clickable decade regions */}
              {decades.map(({ decade }, i) => (
                <rect
                  key={decade}
                  x="0"
                  y={i * ROW_HEIGHT}
                  width="220"
                  height={ROW_HEIGHT}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedDecade(decade)}
                >
                  <title>Click to see books from the {decade}s</title>
                </rect>
              ))}

              {/* Total volume indicator dots */}
              {decades.map((d, i) => {
                const x = (d.total / maxTotal) * 200 + 4;
                const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;
                return (
                  <circle
                    key={d.decade}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#1a1612"
                    opacity="0.3"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedDecade(d.decade)}
                  />
                );
              })}
            </svg>

            {/* Scale indicator */}
            <div style={{ position: "absolute", bottom: "-24px", right: "8px", fontFamily: "Monaco", fontSize: "9px", color: "#666" }}>
              max: {maxTotal} works/decade
            </div>
          </div>

          {/* Right: Historical context */}
          <div style={{ borderLeft: "1px solid #e8e4dc", paddingLeft: "24px" }}>
            <div style={{ fontFamily: "Inter", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #e8e4dc" }}>
              Historical Context
            </div>
            {decades.map(({ decade }) => {
              const ctx = ERA_CONTEXT[decade];
              return (
                <div
                  key={decade}
                  style={{
                    height: `${ROW_HEIGHT}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    paddingTop: "8px",
                    borderBottom: "1px solid #f5f0e8",
                  }}
                >
                  {ctx && (
                    <>
                      <div style={{ fontFamily: "Inter", fontSize: "11px", fontWeight: 600, color: "#9e4a3a", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                        {ctx.era}
                      </div>
                      {ctx.notes.map((note, i) => (
                        <div key={i} style={{ fontFamily: "Newsreader", fontSize: "11px", color: "#666", lineHeight: 1.3, marginBottom: "1px" }}>
                          {note}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "48px", padding: "24px", background: "#f5f0e8", borderRadius: "8px" }}>
          <h3 style={{ fontFamily: "Inter", fontSize: "14px", fontWeight: 600, color: "#1a1612", marginBottom: "12px" }}>
            About This Chart
          </h3>
          <p style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#555", lineHeight: 1.6, marginBottom: "12px" }}>
            The center chart shows the total volume of esoteric publishing per decade, based on the Bibliotheca Philosophica Hermetica catalog.
            Click anywhere on the chart to see the actual books published in that decade.
          </p>
          <p style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#555", lineHeight: 1.6, margin: 0 }}>
            Inspired by Major General J.G.R. Forlong&apos;s 1883 <em>Rivers of Life</em> chart.
          </p>
        </div>
      </div>
    </div>
  );
}
