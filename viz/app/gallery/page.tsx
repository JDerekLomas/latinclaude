"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface GalleryImage {
  id: string;
  title: string;
  artist: string;
  year: number;
  source: string;
  wikimedia_url: string;
  image_url: string;
  license: string;
  categories: string[];
  description: string;
}

interface Category {
  id: string;
  label: string;
  color: string;
}

interface GalleryData {
  metadata: {
    description: string;
    license_note: string;
    last_updated: string;
  };
  images: GalleryImage[];
  categories: Category[];
}

export default function GalleryPage() {
  const [data, setData] = useState<GalleryData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/gallery_images.json")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const filteredImages = useMemo(() => {
    if (!data) return [];
    if (!selectedCategory) return data.images;
    return data.images.filter((img) => img.categories.includes(selectedCategory));
  }, [data, selectedCategory]);

  const getCategoryColor = (categoryId: string): string => {
    const cat = data?.categories.find((c) => c.id === categoryId);
    return cat?.color || "#888";
  };

  const getCategoryLabel = (categoryId: string): string => {
    const cat = data?.categories.find((c) => c.id === categoryId);
    return cat?.label || categoryId;
  };

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdfcf9", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "64px" }}>
        <div style={{ color: "#666", fontFamily: "Inter, sans-serif" }}>Loading gallery...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fdfcf9" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #e8e4dc", padding: "24px", marginTop: "64px", background: "#fdfcf9" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "36px", fontWeight: 500, color: "#1a1612", marginBottom: "8px" }}>
            Renaissance Image Gallery
          </h1>
          <p style={{ fontFamily: "Newsreader, Georgia, serif", fontSize: "17px", color: "#666", marginBottom: "24px" }}>
            Curated images from the esoteric and scientific traditions of early modern Europe.
            <br />
            <span style={{ fontSize: "14px", color: "#888" }}>All images are Public Domain or CC-BY licensed.</span>
          </p>

          {/* Category filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                padding: "6px 14px",
                borderRadius: "20px",
                border: selectedCategory === null ? "2px solid #9e4a3a" : "1px solid #e8e4dc",
                background: selectedCategory === null ? "#9e4a3a" : "#fff",
                color: selectedCategory === null ? "#fff" : "#555",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              All ({data.images.length})
            </button>
            {data.categories
              .filter((cat) => data.images.some((img) => img.categories.includes(cat.id)))
              .map((cat) => {
                const count = data.images.filter((img) => img.categories.includes(cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      border: selectedCategory === cat.id ? `2px solid ${cat.color}` : "1px solid #e8e4dc",
                      background: selectedCategory === cat.id ? cat.color : "#fff",
                      color: selectedCategory === cat.id ? "#fff" : "#555",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              style={{
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", paddingTop: "75%", background: "#f5f0e8" }}>
                {!loadedImages.has(image.id) && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ color: "#999", fontSize: "12px" }}>Loading...</div>
                  </div>
                )}
                <img
                  src={image.image_url}
                  alt={image.title}
                  loading="lazy"
                  onLoad={() => setLoadedImages((prev) => new Set(prev).add(image.id))}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: loadedImages.has(image.id) ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 500, color: "#1a1612", marginBottom: "4px" }}>
                  {image.title}
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  {image.artist}, {image.year}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {image.categories.slice(0, 2).map((catId) => (
                    <span
                      key={catId}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: getCategoryColor(catId) + "20",
                        color: getCategoryColor(catId),
                        border: `1px solid ${getCategoryColor(catId)}40`,
                      }}
                    >
                      {getCategoryLabel(catId)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Image */}
            <div style={{ position: "relative", background: "#1a1612" }}>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                style={{
                  width: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontSize: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Metadata */}
            <div style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 500, color: "#1a1612", marginBottom: "8px" }}>
                {selectedImage.title}
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                {selectedImage.artist} · {selectedImage.year} · <em>{selectedImage.source}</em>
              </p>
              <p style={{ fontFamily: "Newsreader, serif", fontSize: "16px", color: "#444", lineHeight: 1.6, marginBottom: "20px" }}>
                {selectedImage.description}
              </p>

              {/* Categories */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                {selectedImage.categories.map((catId) => (
                  <span
                    key={catId}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: getCategoryColor(catId) + "20",
                      color: getCategoryColor(catId),
                      border: `1px solid ${getCategoryColor(catId)}40`,
                    }}
                  >
                    {getCategoryLabel(catId)}
                  </span>
                ))}
              </div>

              {/* License & Attribution */}
              <div style={{ background: "#f5f0e8", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: "#2ecc71",
                    color: "#fff",
                  }}>
                    {selectedImage.license}
                  </span>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#666", margin: 0 }}>
                  This image is freely available for use with attribution.
                </p>
              </div>

              {/* Links */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href={selectedImage.wikimedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#fff",
                    background: "#9e4a3a",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  View on Wikimedia Commons →
                </a>
                <a
                  href={selectedImage.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#9e4a3a",
                    background: "#fff",
                    border: "1px solid #9e4a3a",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Download Full Resolution
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e8e4dc", padding: "32px 24px", background: "#f5f0e8" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "Newsreader, serif", fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            All images sourced from Wikimedia Commons and other public repositories.
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#888" }}>
            Gallery content licensed under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: "#9e4a3a" }}>
              CC-BY 4.0
            </a>
            . Want to suggest an image?{" "}
            <Link href="/contribute" style={{ color: "#9e4a3a" }}>
              Contribute
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
