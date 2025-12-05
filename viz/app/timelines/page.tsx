"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    TL?: {
      Timeline: new (containerId: string, data: string, options?: object) => void;
    };
  }
}

export default function Timelines() {
  const [activeTimeline, setActiveTimeline] = useState<"printers" | "authors">("printers");
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineLoaded && window.TL && containerRef.current) {
      // Clear previous timeline
      containerRef.current.innerHTML = "";

      const dataUrl = activeTimeline === "printers"
        ? "/printers_timeline.json"
        : "/authors_timeline.json";

      new window.TL.Timeline("timeline-embed", dataUrl, {
        hash_bookmark: false,
        initial_zoom: 2,
        scale_factor: 2,
        timenav_height_percentage: 25,
        default_bg_color: "#0f172a",
      });
    }
  }, [activeTimeline, timelineLoaded]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Script
        src="https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js"
        onLoad={() => setTimelineLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css"
      />

      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Link href="/" className="text-violet-400 hover:underline text-sm">
            &larr; Back to visualization
          </Link>
          <h1 className="text-4xl font-bold mt-4">Renaissance Timelines</h1>
          <p className="text-slate-400 mt-2">
            Interactive timelines of Latin publishing 1450-1700
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Timeline selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTimeline("printers")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTimeline === "printers"
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Major Printers
          </button>
          <button
            onClick={() => setActiveTimeline("authors")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTimeline === "authors"
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Prolific Authors
          </button>
        </div>

        {/* Description */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          {activeTimeline === "printers" ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Major Latin Printers</h2>
              <p className="text-slate-400">
                The 50 most prolific publishers of Latin works (500+ editions each).
                Names like Plantin, Elzevier, and Gryphe shaped what Renaissance Europe read.
                Scroll to navigate through time; click events for details.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Prolific Latin Authors</h2>
              <p className="text-slate-400">
                Authors with 100+ Latin editions in the USTC database. Classical authors
                (Cicero, Aristotle, Virgil) dominate, but Renaissance figures like Erasmus,
                Melanchthon, and Luther also appear prominently.
              </p>
            </>
          )}
        </div>

        {/* Timeline container */}
        <div
          id="timeline-embed"
          ref={containerRef}
          className="bg-slate-900 rounded-xl overflow-hidden"
          style={{ height: "600px" }}
        >
          {!timelineLoaded && (
            <div className="flex items-center justify-center h-full text-slate-400">
              Loading timeline...
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">50</div>
            <div className="text-slate-400 text-sm">Major Printers</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">75</div>
            <div className="text-slate-400 text-sm">Prolific Authors</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">533K</div>
            <div className="text-slate-400 text-sm">Latin Works</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">250</div>
            <div className="text-slate-400 text-sm">Years of Data</div>
          </div>
        </div>

        {/* Map link */}
        <div className="mt-12 bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Animated Map Available</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Watch the spread of Latin printing across Europe from 1450 to 1700.
            See how printing began in Mainz, spread to Venice and Paris, and eventually
            covered the continent.
          </p>
          <a
            href="/map"
            className="inline-block mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-colors"
          >
            Explore the Map
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm mt-12">
        <p>
          Data from USTC &bull; Timeline powered by{" "}
          <a
            href="https://timeline.knightlab.com/"
            className="text-violet-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Knight Lab TimelineJS
          </a>
        </p>
      </footer>
    </div>
  );
}
