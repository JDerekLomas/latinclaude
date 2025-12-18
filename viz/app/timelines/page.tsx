"use client";

import Link from "next/link";
import { useState } from "react";
import LifespanTimeline from "./LifespanTimeline";
import PrintersTimeline from "./PrintersTimeline";
import EditionsTimeline from "./EditionsTimeline";

export default function Timelines() {
  const [activeTimeline, setActiveTimeline] = useState<"lives" | "printers" | "editions">("lives");

  return (
    <div style={{ minHeight: '100vh', background: '#fdfcf9', color: '#1a1612' }}>

      <header style={{ borderBottom: '1px solid #e8e4dc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#9e4a3a', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            &larr; ANCIENT WISDOM RESEARCH
          </Link>
          <a
            href="https://www.ancientwisdomtrust.org/become-a-patron"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              background: '#9e4a3a',
              color: '#fff',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500
            }}
          >
            Support This Work
          </a>
        </div>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px 24px 32px' }}>
          <h1 style={{ fontSize: '42px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>Renaissance Timelines</h1>
          <p style={{ color: '#444', fontFamily: 'Newsreader, serif', marginTop: '8px' }}>
            Interactive timelines of Latin publishing 1450-1700
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px' }}>
        {/* Timeline selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTimeline("lives")}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTimeline === "lives" ? '#9e4a3a' : '#fff',
              color: activeTimeline === "lives" ? '#fff' : '#444',
              boxShadow: activeTimeline === "lives" ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Lives of Thinkers
          </button>
          <button
            onClick={() => setActiveTimeline("printers")}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTimeline === "printers" ? '#9e4a3a' : '#fff',
              color: activeTimeline === "printers" ? '#fff' : '#444',
              boxShadow: activeTimeline === "printers" ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Major Printers
          </button>
          <button
            onClick={() => setActiveTimeline("editions")}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTimeline === "editions" ? '#9e4a3a' : '#fff',
              color: activeTimeline === "editions" ? '#fff' : '#444',
              boxShadow: activeTimeline === "editions" ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            By Edition Count
          </button>
        </div>

        {/* Description */}
        <div style={{ background: '#f5f0e8', border: '1px solid #e0d8c8', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          {activeTimeline === "lives" ? (
            <>
              <h2 style={{ fontSize: '24px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>Lives of Renaissance Thinkers</h2>
              <p style={{ color: '#444', fontFamily: 'Newsreader, serif', fontSize: '15px' }}>
                Birth and death dates of key figures who shaped the Renaissance and early modern period.
                From Petrarch to Newton, see how these thinkers&apos; lives overlapped across four centuries.
                Scroll to navigate; click portraits for details.
              </p>
            </>
          ) : activeTimeline === "printers" ? (
            <>
              <h2 style={{ fontSize: '24px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>Major Latin Printers</h2>
              <p style={{ color: '#444', fontFamily: 'Newsreader, serif', fontSize: '15px' }}>
                The 50 most prolific publishers of Latin works (500+ editions each).
                Names like Plantin, Elzevier, and Gryphe shaped what Renaissance Europe read.
                Scroll to navigate through time; click events for details.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '24px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>Authors by Edition Count</h2>
              <p style={{ color: '#444', fontFamily: 'Newsreader, serif', fontSize: '15px' }}>
                Authors with 100+ Latin editions in the USTC database. Classical authors
                (Cicero, Aristotle, Virgil) dominate, but Renaissance figures like Erasmus,
                Melanchthon, and Luther also appear prominently.
              </p>
            </>
          )}
        </div>

        {/* Timeline container */}
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e8e4dc',
        }}>
          {activeTimeline === "lives" && <LifespanTimeline />}
          {activeTimeline === "printers" && <PrintersTimeline />}
          {activeTimeline === "editions" && <EditionsTimeline />}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '32px' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#9e4a3a', fontFamily: 'Inter, sans-serif' }}>55</div>
            <div style={{ color: '#888', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>Key Thinkers</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#546b8a', fontFamily: 'Inter, sans-serif' }}>50</div>
            <div style={{ color: '#888', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>Major Printers</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#c9a86c', fontFamily: 'Inter, sans-serif' }}>533K</div>
            <div style={{ color: '#888', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>Latin Works</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#8b9a7d', fontFamily: 'Inter, sans-serif' }}>400</div>
            <div style={{ color: '#888', fontSize: '13px', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>Years Covered</div>
          </div>
        </div>

        {/* Map link */}
        <div style={{
          marginTop: '48px',
          background: 'linear-gradient(135deg, #9e4a3a15 0%, #546b8a15 100%)',
          border: '1px solid #9e4a3a30',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '16px' }}>Animated Map Available</h2>
          <p style={{ color: '#444', fontFamily: 'Newsreader, serif', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Watch the spread of Latin printing across Europe from 1450 to 1700.
            See how printing began in Mainz, spread to Venice and Paris, and eventually
            covered the continent.
          </p>
          <a
            href="/map"
            style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 24px',
              background: '#8b9a7d',
              color: '#fff',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            Explore the Map
          </a>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e8e4dc', padding: '32px 0', textAlign: 'center', color: '#888', fontSize: '14px', fontFamily: 'Inter, sans-serif', marginTop: '48px' }}>
        <p>
          Data from{" "}
          <a
            href="https://ustc.ac.uk/"
            style={{ color: '#9e4a3a', textDecoration: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Universal Short Title Catalogue
          </a>
        </p>
      </footer>
    </div>
  );
}

