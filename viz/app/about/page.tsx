import Link from "next/link";

export default function AboutPage() {
  return (
    <main style={{ background: '#fdfcf9', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid #e8e4dc',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: '#666',
            textDecoration: 'none',
          }}>
            ← SECOND RENAISSANCE
          </Link>
          <a
            href="https://www.ancientwisdomtrust.org/become-a-patron"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#fff',
              background: '#9e4a3a',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
          >
            Support This Work
          </a>
        </div>
      </nav>

      {/* Content */}
      <article style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '80px 24px 120px',
      }}>
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '42px',
            fontWeight: 400,
            color: '#1a1612',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}>
            About Second Renaissance Research
          </h1>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '22px',
            lineHeight: 1.5,
            color: '#555',
          }}>
            The original Renaissance was sparked by rediscovering ancient texts.
            We&apos;re working to unlock the half million that came next.
          </p>
        </header>

        {/* The Institution */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            The Embassy of the Free Mind
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            This research is based at the <a href="https://embassyofthefreemind.com" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Embassy of the Free Mind</a> in
            Amsterdam, home to the Bibliotheca Philosophica Hermetica—one of the world&apos;s
            most important collections of texts on Western esotericism, Hermetica, alchemy,
            mysticism, and Rosicrucianism.
          </p>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            The Ritman Library holds over 25,000 books and manuscripts documenting the
            history of spiritual thought from antiquity to the present. Many of these
            texts—like much of Renaissance Latin scholarship—remain untranslated and
            inaccessible to modern readers.
          </p>
        </section>

        {/* The Problem */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            The Problem We&apos;re Addressing
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            Between 1450 and 1700, European printers produced over 500,000 Latin works.
            These books represent the bulk of Renaissance intellectual output: theology,
            philosophy, law, medicine, natural philosophy, poetry, and more.
          </p>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            Less than 2% have English translations.
          </p>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            This creates a profound accessibility gap. Scholars working on the history
            of science cannot read Newton&apos;s sources. Religious historians cannot access
            Reformation theology. Legal historians cannot examine the jurisprudence that
            shaped modern law. The intellectual foundations of the modern world are
            locked away in a language few can read.
          </p>
        </section>

        {/* What We're Doing */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            What We&apos;re Building
          </h2>

          <div style={{
            background: '#f5f0e8',
            border: '1px solid #e0d8c8',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: '#666',
              marginBottom: '8px',
            }}>SOURCE LIBRARY</h3>
            <p style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#444',
              marginBottom: '12px',
            }}>
              Our freely accessible collection of translated primary sources.
              As we complete translations, they&apos;re published here for scholars and
              the public alike.
            </p>
            <a href="https://sourcelibrary.org" target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#9e4a3a',
            }}>
              Visit Source Library →
            </a>
          </div>

          <div style={{
            background: '#f5f0e8',
            border: '1px solid #e0d8c8',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: '#666',
              marginBottom: '8px',
            }}>DATA VISUALIZATION</h3>
            <p style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#444',
              marginBottom: '12px',
            }}>
              Interactive visualizations of the Universal Short Title Catalogue (USTC),
              mapping 1.6 million printed works across Europe. Charts, maps, and timelines
              that make the scale of the opportunity visible.
            </p>
            <Link href="/explore" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#9e4a3a',
            }}>
              Explore the data →
            </Link>
          </div>

          <div style={{
            background: '#f5f0e8',
            border: '1px solid #e0d8c8',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: '#666',
              marginBottom: '8px',
            }}>TRANSLATION ROADMAP</h3>
            <p style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#444',
              marginBottom: '12px',
            }}>
              A systematic framework for prioritizing which untranslated works matter most.
              Tiered recommendations based on historical impact, translation gap, feasibility,
              and audience reach.
            </p>
            <Link href="/roadmap" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#9e4a3a',
            }}>
              View the roadmap →
            </Link>
          </div>

          <div style={{
            background: '#f5f0e8',
            border: '1px solid #e0d8c8',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: '#666',
              marginBottom: '8px',
            }}>RESEARCH ESSAYS</h3>
            <p style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#444',
              marginBottom: '12px',
            }}>
              In-depth analysis of the translation landscape, forgotten authors,
              Renaissance bestsellers, and the methodology behind our estimates.
            </p>
            <Link href="/blog" style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#9e4a3a',
            }}>
              Read the essays →
            </Link>
          </div>
        </section>

        {/* How to Support */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            How to Support This Work
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            The <a href="https://www.ancientwisdomtrust.org/become-a-patron" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Ancient Wisdom Trust</a> is
            the fundraising arm of our translation initiative. Your contributions directly fund:
          </p>
          <ul style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
            paddingLeft: '24px',
          }}>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#1a1612' }}>Translation projects</strong> — Professional scholars translating priority texts
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#1a1612' }}>Digitization efforts</strong> — Making manuscript scans searchable and accessible
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#1a1612' }}>Cataloging work</strong> — Building comprehensive databases of what exists and what&apos;s been translated
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#1a1612' }}>Open access publishing</strong> — All translations are published freely at <a href="https://sourcelibrary.org" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Source Library</a>
            </li>
          </ul>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            Every contribution, regardless of size, helps unlock texts that have been inaccessible for centuries.
          </p>
        </section>

        {/* The Larger Vision */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            The Larger Vision
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            The first Renaissance transformed European thought by recovering Greek and
            Roman texts that had been forgotten for centuries. Scholars like Ficino and
            Pico della Mirandola translated works that reshaped philosophy, science, and art.
          </p>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            But the Renaissance itself produced half a million Latin works—and those are
            now as inaccessible as the ancient texts once were. The same pattern holds for
            Sanskrit, Classical Arabic, and Classical Chinese: vast corpuses of human thought,
            locked away by language barriers.
          </p>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '19px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            The tools for a second renaissance—digitization, OCR, AI-assisted translation—are
            advancing rapidly. What&apos;s needed is coordination and funding. Our hope is that
            this project demonstrates both the scale of the opportunity and the feasibility
            of seizing it.
          </p>
        </section>

        {/* Call to Action */}
        <section style={{
          background: '#1a1612',
          color: '#fff',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '32px',
            fontWeight: 400,
            color: '#fff',
            marginBottom: '16px',
          }}>
            Support the Work
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '32px',
            maxWidth: '480px',
            margin: '0 auto 32px',
          }}>
            The Ancient Wisdom Trust funds cataloging, digitization, and translation
            of essential texts. Every contribution helps unlock more of the hidden
            libraries.
          </p>
          <a
            href="https://www.ancientwisdomtrust.org/become-a-patron"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1a1612',
              background: '#c9a86c',
              padding: '16px 48px',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
          >
            Donate to Ancient Wisdom Trust
          </a>
        </section>

        {/* Licensing */}
        <section style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e8e4dc' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '24px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            Open Access & Licensing
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#444',
            marginBottom: '20px',
          }}>
            We believe knowledge should be freely accessible. All our work is released under open licenses compatible with the Internet Archive and academic use:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                background: '#2ecc71',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}>CC-BY 4.0</span>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: '16px', color: '#555' }}>
                Site content, essays, and visualizations — free to share and adapt with attribution
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                background: '#3498db',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}>ODbL</span>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: '16px', color: '#555' }}>
                Datasets (USTC, BPH catalog, printing map) — <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Open Database License</a>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '4px',
                background: '#9b59b6',
                color: '#fff',
                whiteSpace: 'nowrap',
              }}>MIT</span>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: '16px', color: '#555' }}>
                Source code — <a href="https://github.com/JDerekLomas/secondrenaissance" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>GitHub repository</a>
              </span>
            </div>
          </div>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#444',
          }}>
            <Link href="/data/download" style={{ color: '#9e4a3a' }}>Download our open datasets →</Link>
          </p>
        </section>

        {/* Contact */}
        <section style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #e8e4dc' }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '24px',
            fontWeight: 400,
            color: '#1a1612',
            marginBottom: '16px',
          }}>
            Contact
          </h2>
          <p style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '17px',
            lineHeight: 1.7,
            color: '#444',
          }}>
            For inquiries about this research or potential collaborations, contact us
            through the <a href="https://embassyofthefreemind.com" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Embassy of the Free Mind</a>.
          </p>
        </section>
      </article>

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
          marginBottom: '8px',
        }}>
          Data from the <a href="https://ustc.ac.uk" style={{ color: '#666' }}>Universal Short Title Catalogue</a>, University of St Andrews
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: '#aaa',
        }}>
          Content: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: '#888' }}>CC-BY 4.0</a> · Data: <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" style={{ color: '#888' }}>ODbL</a> · Code: <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" style={{ color: '#888' }}>MIT</a>
        </p>
      </footer>
    </main>
  );
}
