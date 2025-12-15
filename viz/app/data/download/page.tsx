"use client";

import { useState } from "react";
import Link from "next/link";

interface Dataset {
  id: string;
  name: string;
  description: string;
  format: string[];
  size: string;
  records: string;
  files: { format: string; path: string }[];
}

const DATASETS: Dataset[] = [
  {
    id: "ustc-latin",
    name: "USTC Latin Works",
    description: "Top 1,200 Latin works by edition count, with author, title, genre, and publication data from the Universal Short Title Catalogue.",
    format: ["JSON", "CSV"],
    size: "208 KB",
    records: "1,200 works",
    files: [
      { format: "JSON", path: "/top_1200_latin_works.json" },
    ],
  },
  {
    id: "printing-centers",
    name: "Printing Centers Map",
    description: "Geographic coordinates for 702 European printing centers active between 1450-1700, with yearly publication counts.",
    format: ["JSON"],
    size: "686 KB",
    records: "702 locations",
    files: [
      { format: "JSON", path: "/printing_map_data.json" },
    ],
  },
  {
    id: "bph-catalog",
    name: "BPH Hermetic Library",
    description: "Bibliotheca Philosophica Hermetica catalog: 28,000 esoteric works including Hermetica, alchemy, Kabbalah, and Rosicrucianism.",
    format: ["JSON"],
    size: "~5 MB",
    records: "28,000 works",
    files: [
      { format: "JSON", path: "/api/bph/catalog?limit=28000" },
    ],
  },
  {
    id: "rivers-of-life",
    name: "Rivers of Esoteric Life",
    description: "Year-by-year publication counts for 9 esoteric traditions (1469-1750), plus annotated historical events.",
    format: ["JSON"],
    size: "42 KB",
    records: "282 years",
    files: [
      { format: "JSON", path: "/rivers_of_life.json" },
      { format: "JSON", path: "/rivers_annotations.json" },
    ],
  },
  {
    id: "viz-data",
    name: "USTC Statistics",
    description: "Aggregated statistics from the USTC: language breakdown, accessibility funnel, and Latin publishing trends.",
    format: ["JSON"],
    size: "22 KB",
    records: "Summary stats",
    files: [
      { format: "JSON", path: "/viz_data.json" },
    ],
  },
];

export default function DataDownloadPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setShowModal(true);
    setDownloadStarted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedDataset) return;

    setIsSubmitting(true);

    try {
      // Record the download
      await fetch("/api/data/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newsletter,
          dataset: selectedDataset.id,
        }),
      });

      // Start download
      setDownloadStarted(true);

      // Trigger file download
      for (const file of selectedDataset.files) {
        const link = document.createElement("a");
        link.href = file.path;
        link.download = file.path.split("/").pop() || "data.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        setEmail("");
        setSelectedDataset(null);
      }, 2000);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdfcf9" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #e8e4dc", padding: "24px", marginTop: "64px", background: "#fdfcf9" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Link href="/data" style={{ color: "#9e4a3a", fontSize: "13px", textDecoration: "none", fontFamily: "Inter" }}>
            ← Data Dashboard
          </Link>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "36px", fontWeight: 500, color: "#1a1612", marginTop: "12px", marginBottom: "8px" }}>
            Download Open Data
          </h1>
          <p style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: "17px", color: "#666", marginBottom: "16px" }}>
            All our datasets are freely available under the{" "}
            <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" style={{ color: "#9e4a3a" }}>
              Open Database License (ODbL)
            </a>
            .
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ background: "#2ecc71", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontFamily: "Inter", fontWeight: 600 }}>
                ODbL
              </span>
              <span style={{ fontFamily: "Inter", fontSize: "12px", color: "#666" }}>Free to use with attribution</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ background: "#3498db", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontFamily: "Inter", fontWeight: 600 }}>
                IA Compatible
              </span>
              <span style={{ fontFamily: "Inter", fontSize: "12px", color: "#666" }}>Internet Archive friendly</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dataset Cards */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {DATASETS.map((dataset) => (
            <div
              key={dataset.id}
              style={{
                background: "#fff",
                border: "1px solid #e8e4dc",
                borderRadius: "12px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "24px",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 500, color: "#1a1612", marginBottom: "8px" }}>
                  {dataset.name}
                </h2>
                <p style={{ fontFamily: "Newsreader, serif", fontSize: "15px", color: "#555", lineHeight: 1.5, marginBottom: "12px" }}>
                  {dataset.description}
                </p>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "Inter", fontSize: "12px", color: "#888" }}>
                    <strong style={{ color: "#666" }}>{dataset.records}</strong>
                  </span>
                  <span style={{ fontFamily: "Inter", fontSize: "12px", color: "#888" }}>
                    <strong style={{ color: "#666" }}>{dataset.size}</strong>
                  </span>
                  <span style={{ fontFamily: "Inter", fontSize: "12px", color: "#888" }}>
                    Format: <strong style={{ color: "#666" }}>{dataset.format.join(", ")}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDownloadClick(dataset)}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  background: "#9e4a3a",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#8a4033")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#9e4a3a")}
              >
                Download
              </button>
            </div>
          ))}
        </div>

        {/* Attribution Note */}
        <div style={{ marginTop: "48px", padding: "24px", background: "#f5f0e8", borderRadius: "12px" }}>
          <h3 style={{ fontFamily: "Inter", fontSize: "14px", fontWeight: 600, color: "#1a1612", marginBottom: "12px" }}>
            How to Cite
          </h3>
          <p style={{ fontFamily: "Monaco, monospace", fontSize: "12px", color: "#555", background: "#fff", padding: "16px", borderRadius: "6px", lineHeight: 1.6 }}>
            Second Renaissance Research. (2024). [Dataset Name]. Retrieved from https://secondrenaissance.ai/data/download. Licensed under ODbL.
          </p>
          <p style={{ fontFamily: "Newsreader", fontSize: "14px", color: "#666", marginTop: "12px" }}>
            Please attribute "Second Renaissance Research" when using these datasets. Share-alike: if you modify the data, release under the same license.
          </p>
        </div>
      </main>

      {/* Email Modal */}
      {showModal && selectedDataset && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "440px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {downloadStarted ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
                <h2 style={{ fontFamily: "Cormorant Garamond", fontSize: "24px", color: "#1a1612", marginBottom: "8px" }}>
                  Download Started!
                </h2>
                <p style={{ fontFamily: "Newsreader", fontSize: "15px", color: "#666" }}>
                  Thank you for your interest in our data.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontFamily: "Cormorant Garamond", fontSize: "24px", color: "#1a1612", marginBottom: "8px" }}>
                  Download {selectedDataset.name}
                </h2>
                <p style={{ fontFamily: "Newsreader", fontSize: "15px", color: "#666", marginBottom: "24px" }}>
                  Enter your email to start the download. We'll send you a copy for your records.
                </p>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontFamily: "Inter", fontSize: "13px", color: "#555", display: "block", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e8e4dc",
                      borderRadius: "6px",
                      fontFamily: "Inter",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    style={{ marginTop: "3px" }}
                  />
                  <span style={{ fontFamily: "Inter", fontSize: "13px", color: "#666" }}>
                    Keep me updated on new datasets and features
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  style={{
                    width: "100%",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#fff",
                    background: isSubmitting ? "#ccc" : "#9e4a3a",
                    border: "none",
                    padding: "14px",
                    borderRadius: "8px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Processing..." : "Download Now"}
                </button>

                <p style={{ fontFamily: "Inter", fontSize: "11px", color: "#999", marginTop: "16px", textAlign: "center" }}>
                  By downloading, you agree to the ODbL license terms.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
