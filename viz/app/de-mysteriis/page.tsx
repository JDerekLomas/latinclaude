'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types for the hierarchy
interface Being {
  id: string;
  name: string;
  latinName: string;
  level: number;
  properties: {
    unity: number;      // 0-100: 100 = pure unity, 0 = pure multiplicity
    permanence: number; // 0-100: 100 = immobile, 0 = in motion
    independence: number; // 0-100: 100 = cause, 0 = dependent
    comprehension: number; // 0-100: 100 = incomprehensible, 0 = bounded
  };
  description: string;
  quote?: string;
  color: string;
  glowColor: string;
}

const beings: Being[] = [
  {
    id: 'good',
    name: 'The Good Itself',
    latinName: 'Ipsum Bonum',
    level: 0,
    properties: { unity: 100, permanence: 100, independence: 100, comprehension: 100 },
    description: 'The first of divine things, the source beyond essence from which all emanates.',
    quote: 'The good itself is above essence and is called the cause of the good.',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.6)',
  },
  {
    id: 'gods',
    name: 'The Gods',
    latinName: 'Dii',
    level: 1,
    properties: { unity: 95, permanence: 95, independence: 90, comprehension: 95 },
    description: 'Unity, permanence in themselves, immobile cause of motions, eminent providence.',
    quote: 'The gods can do all things, in a moment, united.',
    color: '#fff8dc',
    glowColor: 'rgba(255, 248, 220, 0.5)',
  },
  {
    id: 'daemons',
    name: 'Daemons',
    latinName: 'Daemones',
    level: 2,
    properties: { unity: 70, permanence: 70, independence: 65, comprehension: 70 },
    description: 'Ministers of the gods, expressing what is hidden in the divine. More divine than human.',
    quote: 'What is ineffable and hidden in the gods, the daemons express and reveal.',
    color: '#e6e6fa',
    glowColor: 'rgba(230, 230, 250, 0.4)',
  },
  {
    id: 'heroes',
    name: 'Heroes',
    latinName: 'Heroes',
    level: 3,
    properties: { unity: 45, permanence: 45, independence: 40, comprehension: 45 },
    description: 'Greater than humans, closer to souls. Possess divine qualities under conditions of multiplicity.',
    quote: 'In heroes more of the human, in daemons more of the divine.',
    color: '#b8860b',
    glowColor: 'rgba(184, 134, 11, 0.35)',
  },
  {
    id: 'souls',
    name: 'Rational Souls',
    latinName: 'Animae Rationales',
    level: 4,
    properties: { unity: 20, permanence: 20, independence: 15, comprehension: 20 },
    description: 'Inclination toward multiplicity and motion, conjunction with the gods through participation.',
    quote: 'Souls proceed from some things to others, from imperfect to perfect.',
    color: '#8fbc8f',
    glowColor: 'rgba(143, 188, 143, 0.3)',
  },
];

const propertyLabels = {
  unity: { high: 'Unity', low: 'Multiplicity' },
  permanence: { high: 'Permanence', low: 'Motion' },
  independence: { high: 'Cause', low: 'Dependent' },
  comprehension: { high: 'Incomprehensible', low: 'Bounded' },
};

// Celestial Hierarchy Visualization
function CelestialHierarchy({ selectedBeing, onSelect }: { selectedBeing: Being | null; onSelect: (b: Being) => void }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '500px',
      background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a2e 50%, #2d2d44 100%)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Stars background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(1px 1px at 20px 30px, white, transparent), radial-gradient(1px 1px at 40px 70px, white, transparent), radial-gradient(1px 1px at 50px 160px, white, transparent), radial-gradient(1px 1px at 90px 40px, white, transparent), radial-gradient(1px 1px at 130px 80px, white, transparent), radial-gradient(1px 1px at 160px 120px, white, transparent)',
        opacity: 0.5,
      }} />

      {/* Emanation lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="emanation" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8fbc8f" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <line x1="50%" y1="50" x2="50%" y2="450" stroke="url(#emanation)" strokeWidth="2" strokeDasharray="4,4" />
      </svg>

      {/* Beings */}
      {beings.map((being, index) => {
        const y = 50 + index * 90;
        const isSelected = selectedBeing?.id === being.id;

        return (
          <div
            key={being.id}
            onClick={() => onSelect(being)}
            style={{
              position: 'absolute',
              left: '50%',
              top: `${y}px`,
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: isSelected ? '140px' : '100px',
              height: isSelected ? '140px' : '100px',
              background: `radial-gradient(circle, ${being.glowColor} 0%, transparent 70%)`,
              borderRadius: '50%',
              transition: 'all 0.3s ease',
            }} />

            {/* Circle */}
            <div style={{
              position: 'relative',
              width: isSelected ? '80px' : '60px',
              height: isSelected ? '80px' : '60px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${being.color}, ${being.color}88)`,
              border: `2px solid ${being.color}`,
              boxShadow: isSelected ? `0 0 30px ${being.glowColor}` : `0 0 15px ${being.glowColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                fontSize: isSelected ? '11px' : '9px',
                fontWeight: 600,
                color: being.level === 0 ? '#1a1a2e' : '#fff',
                textAlign: 'center',
                textShadow: being.level === 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.8)',
                padding: '4px',
                lineHeight: 1.2,
              }}>
                {being.name}
              </span>
            </div>

            {/* Latin name */}
            <div style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: '16px',
              whiteSpace: 'nowrap',
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '14px',
              color: being.color,
              opacity: isSelected ? 1 : 0.7,
              transition: 'opacity 0.3s ease',
            }}>
              {being.latinName}
            </div>
          </div>
        );
      })}

      {/* Labels */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Click to explore
      </div>

      {/* Elemental analogy */}
      <div style={{
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        color: '#888',
        lineHeight: 1.6,
      }}>
        <div style={{ fontStyle: 'italic', marginBottom: '4px' }}>&quot;Just as between fire and earth</div>
        <div style={{ fontStyle: 'italic' }}>there is air and water...&quot;</div>
      </div>
    </div>
  );
}

// Properties Matrix
function PropertiesMatrix({ selectedBeing }: { selectedBeing: Being | null }) {
  const properties = ['unity', 'permanence', 'independence', 'comprehension'] as const;

  return (
    <div style={{
      background: '#fdfcf9',
      border: '1px solid #e8e4dc',
      borderRadius: '12px',
      padding: '24px',
    }}>
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '20px',
        fontWeight: 500,
        color: '#1a1612',
        marginBottom: '20px',
      }}>
        Properties of Being
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {properties.map((prop) => (
          <div key={prop}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: '#666',
            }}>
              <span>{propertyLabels[prop].low}</span>
              <span>{propertyLabels[prop].high}</span>
            </div>
            <div style={{
              position: 'relative',
              height: '24px',
              background: 'linear-gradient(to right, #8fbc8f33, #ffd70033)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* All beings markers */}
              {beings.map((being) => (
                <div
                  key={being.id}
                  style={{
                    position: 'absolute',
                    left: `${being.properties[prop]}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: selectedBeing?.id === being.id ? '16px' : '10px',
                    height: selectedBeing?.id === being.id ? '16px' : '10px',
                    borderRadius: '50%',
                    background: being.color,
                    border: `2px solid ${selectedBeing?.id === being.id ? '#1a1612' : being.color}`,
                    boxShadow: selectedBeing?.id === being.id ? `0 0 10px ${being.glowColor}` : 'none',
                    transition: 'all 0.3s ease',
                    zIndex: selectedBeing?.id === being.id ? 10 : 1,
                  }}
                  title={being.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {beings.map((being) => (
          <div key={being.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: selectedBeing ? (selectedBeing.id === being.id ? 1 : 0.4) : 1,
            transition: 'opacity 0.3s ease',
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: being.color,
              border: `1px solid ${being.color}88`,
            }} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: '#666',
            }}>
              {being.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Translation Flow Diagram
function TranslationFlow() {
  const [hoveredFlow, setHoveredFlow] = useState<'down' | 'up' | null>(null);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1612 0%, #2d2820 100%)',
      borderRadius: '12px',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <h3 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '20px',
        fontWeight: 500,
        color: '#f5f0e8',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        The Flow of Divine Communication
      </h3>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: '300px',
      }}>
        {/* Downward flow */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '20px',
            cursor: 'pointer',
            opacity: hoveredFlow === 'up' ? 0.4 : 1,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={() => setHoveredFlow('down')}
          onMouseLeave={() => setHoveredFlow(null)}
        >
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#ffd700',
            marginBottom: '20px',
          }}>
            EMANATION ↓
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { text: 'Divine Gifts', color: '#ffd700' },
              { text: 'Daemons express & reveal', color: '#e6e6fa' },
              { text: 'Heroes adapt & translate', color: '#b8860b' },
              { text: 'Souls receive', color: '#8fbc8f' },
            ].map((item, i) => (
              <div key={i} style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '14px',
                color: item.color,
                padding: '8px 16px',
                background: `${item.color}15`,
                borderRadius: '20px',
                border: `1px solid ${item.color}33`,
              }}>
                {item.text}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#999',
            lineHeight: 1.5,
          }}>
            &quot;They translate divine things to us&quot;
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '280px',
          background: 'linear-gradient(to bottom, transparent, #666, transparent)',
        }} />

        {/* Upward flow */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '20px',
            cursor: 'pointer',
            opacity: hoveredFlow === 'down' ? 0.4 : 1,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={() => setHoveredFlow('up')}
          onMouseLeave={() => setHoveredFlow(null)}
        >
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#8fbc8f',
            marginBottom: '20px',
          }}>
            ↑ RETURN
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { text: 'Union with the Divine', color: '#ffd700' },
              { text: 'Daemons & Heroes mediate', color: '#b8860b' },
              { text: 'Prayer & Sacrifice', color: '#e6e6fa' },
              { text: 'Soul\'s aspiration', color: '#8fbc8f' },
            ].map((item, i) => (
              <div key={i} style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '14px',
                color: item.color,
                padding: '8px 16px',
                background: `${item.color}15`,
                borderRadius: '20px',
                border: `1px solid ${item.color}33`,
              }}>
                {item.text}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#999',
            lineHeight: 1.5,
          }}>
            &quot;...and equally lead our things up to divine things&quot;
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail Panel
function DetailPanel({ being }: { being: Being | null }) {
  if (!being) {
    return (
      <div style={{
        background: '#f5f0e8',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '18px',
          color: '#666',
          fontStyle: 'italic',
        }}>
          Select a being from the hierarchy to explore its properties
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#f5f0e8',
      borderRadius: '12px',
      padding: '32px',
      borderLeft: `4px solid ${being.color}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${being.color}, ${being.color}88)`,
          boxShadow: `0 0 20px ${being.glowColor}`,
        }} />
        <div>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '24px',
            fontWeight: 500,
            color: '#1a1612',
            margin: 0,
          }}>
            {being.name}
          </h3>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '16px',
            color: '#666',
          }}>
            {being.latinName}
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#444',
        lineHeight: 1.7,
        marginBottom: '20px',
      }}>
        {being.description}
      </p>

      {being.quote && (
        <blockquote style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: '#666',
          borderLeft: '3px solid #ddd',
          paddingLeft: '16px',
          margin: 0,
        }}>
          &quot;{being.quote}&quot;
        </blockquote>
      )}
    </div>
  );
}

// Main Page Component
export default function DeMysteriisPage() {
  const [selectedBeing, setSelectedBeing] = useState<Being | null>(null);

  return (
    <main style={{ background: '#fdfcf9', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid #e8e4dc',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/blog" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: '#666',
            textDecoration: 'none',
          }}>
            ← RESEARCH
          </Link>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '14px',
            color: '#999',
            fontStyle: 'italic',
          }}>
            Iamblichus &middot; De Mysteriis &middot; Ficino Translation (1570)
          </span>
        </div>
      </nav>

      {/* Header */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: '#9e4a3a',
          marginBottom: '16px',
        }}>
          INTERACTIVE VISUALIZATION
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '48px',
          fontWeight: 400,
          color: '#1a1612',
          lineHeight: 1.2,
          marginBottom: '16px',
        }}>
          The Celestial Hierarchy
        </h1>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '20px',
          color: '#666',
          fontStyle: 'italic',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Mapping the order of divine beings in Iamblichus&apos; De Mysteriis
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        {/* Introduction */}
        <div style={{
          maxWidth: '680px',
          margin: '0 auto 48px',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: '#444',
            lineHeight: 1.8,
          }}>
            Iamblichus describes a cosmic hierarchy where divine power flows downward through
            intermediary beings, and human souls can ascend back through ritual and contemplation.
            This visualization maps the key entities and their properties as described in Marsilio
            Ficino&apos;s 1570 Latin translation.
          </p>
        </div>

        {/* Hierarchy + Detail */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '48px',
        }}>
          <CelestialHierarchy selectedBeing={selectedBeing} onSelect={setSelectedBeing} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DetailPanel being={selectedBeing} />
            <PropertiesMatrix selectedBeing={selectedBeing} />
          </div>
        </div>

        {/* Translation Flow */}
        <div style={{ marginBottom: '48px' }}>
          <TranslationFlow />
        </div>

        {/* Source text note */}
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '32px',
          background: '#f5f0e8',
          borderRadius: '12px',
        }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '18px',
            fontWeight: 500,
            color: '#1a1612',
            marginBottom: '12px',
          }}>
            About This Visualization
          </h3>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.7,
            marginBottom: '16px',
          }}>
            This visualization is based on our ongoing OCR and translation of Ficino&apos;s 1570
            Latin edition of Iamblichus&apos; <em>De Mysteriis</em>. The hierarchy and properties
            are drawn directly from pages 14-25 of the original text.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.7,
          }}>
            Key concepts visualized: the chain of being from <em>Ipsum Bonum</em> (The Good Itself)
            through the gods, daemons, heroes, to rational souls; the elemental analogy (fire/air/water/earth);
            and the bidirectional flow of divine emanation and human return through sacrifice and contemplation.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e8e4dc',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888',
        }}>
          Part of the <a href="/" style={{ color: '#666' }}>Ancient Wisdom Research</a> project
        </p>
      </footer>
    </main>
  );
}
