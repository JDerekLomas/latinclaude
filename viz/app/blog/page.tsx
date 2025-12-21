import Link from "next/link";

// Pinned posts - featured at the top
const pinnedPosts = [
  {
    slug: "cornelis-drebbel",
    title: "Cornelis Drebbel: The Dutch Alchemist Who Invented the Future",
    date: "Dec 21, 2025",
    excerpt: "He built the first cybernetic system, the first submarine, the first air conditioning—and inspired Shakespeare's Prospero and Francis Bacon's Salomon's House. No one knows about him.",
    tag: "Research",
  },
  {
    slug: "sourcelibrary-vision",
    title: "SourceLibrary: A Vision for AI-Assisted Translation",
    date: "Dec 12, 2025",
    excerpt: "Half a million Renaissance Latin texts await translation. We're building tools to make that possible—not by replacing scholars, but by empowering them with expert-driven, AI-assisted workflows.",
    tag: "Vision",
  },
  {
    slug: "why-latin-matters",
    title: "Why Latin Matters: 500,000 Unread Books",
    date: "Dec 1, 2025",
    excerpt: "The Renaissance produced half a million Latin works. 97% have never been translated. What are we missing?",
    tag: "Mission",
  },
  {
    slug: "roadmap",
    title: "Translation Roadmap: Prioritizing 500,000 Works",
    date: "Dec 1, 2025",
    excerpt: "A systematic approach to translation priorities. We score works by historical impact, translation gap, feasibility, and audience to identify what to translate first.",
    tag: "Mission",
  },
];

// All posts in reverse chronological order (newest first)
const posts = [
  {
    slug: "cornelis-drebbel",
    title: "Cornelis Drebbel: The Dutch Alchemist Who Invented the Future",
    date: "Dec 21, 2025",
    excerpt: "He built the first cybernetic system, the first submarine, the first air conditioning—and inspired Shakespeare's Prospero and Francis Bacon's Salomon's House. No one knows about him.",
    tag: "Research",
    category: "Inventors",
  },
  {
    slug: "sourcelibrary-vision",
    title: "SourceLibrary: A Vision for AI-Assisted Translation",
    date: "Dec 12, 2025",
    excerpt: "Half a million Renaissance Latin texts await translation. We're building tools to make that possible—not by replacing scholars, but by empowering them with expert-driven, AI-assisted workflows.",
    tag: "Vision",
    category: "Tools",
  },
  {
    slug: "bph-ia-matching",
    title: "From 2% to 26%: The Journey to Match Historical Catalogs",
    date: "Dec 10, 2025",
    excerpt: "How we evolved from prefix matching (2%) to fuzzy strings (18.6%) to semantic embeddings (65%) to multi-signal matching (26%). The story of matching the BPH catalog against the Internet Archive.",
    tag: "Methods",
    category: "Data",
  },
  {
    slug: "esoteric-digitization",
    title: "How Much Esoteric Latin Is Really Missing from the Internet Archive?",
    date: "Dec 8, 2025",
    excerpt: "We matched 10,683 Latin works from Amsterdam's Hermetic library against the Internet Archive. Fuzzy matching found 18.6%—with dramatic variation by century (65% for 15th c., 11% for 20th c.).",
    tag: "Analysis",
    category: "Esoterica",
  },
  {
    slug: "hidden-hermetic-library",
    title: "The Hidden Hermetic Library: What the Embassy of the Free Mind Reveals About Cataloging Gaps",
    date: "Dec 7, 2025",
    excerpt: "We cross-referenced Amsterdam's esoteric collection with standard bibliographies. 35% of their 15th-century holdings don't appear in ISTC or USTC. These aren't marginal texts—they include Ficino, Pico, and Hermes Trismegistus.",
    tag: "Analysis",
    category: "Esoterica",
  },
  {
    slug: "death-of-latin",
    title: "The Death of Latin? What 1.6 Million Books Tell Us",
    date: "Dec 6, 2025",
    excerpt: "German overtook Latin in the 1670s. We analyzed the complete USTC database to pinpoint exactly when Europe's lingua franca lost its dominance.",
    tag: "Data",
    category: "History",
  },
  {
    slug: "gaps-of-the-greats",
    title: "Gaps of the Greats: Major Works by Famous Figures That Remain Untranslated",
    date: "Dec 6, 2025",
    excerpt: "Even Ficino, Pico, Bruno, Agrippa, and Fludd have major works locked in Latin. We catalog what's translated and what's not for Renaissance thought's most famous figures.",
    tag: "Analysis",
    category: "Authors",
  },
  {
    slug: "lost-books",
    title: "The Dark Matter of Book History: How Many Latin Works Are Lost Forever?",
    date: "Dec 5, 2025",
    excerpt: "We count 500,000 surviving Latin works. But estimates suggest 25-80% of editions were lost entirely. What does this mean for our understanding of the Renaissance?",
    tag: "Analysis",
    category: "History",
  },
  {
    slug: "theology-problem",
    title: "The Elephant in the Room: 114,000 Latin Theological Works",
    date: "Dec 4, 2025",
    excerpt: "Theology is the largest category in the Latin corpus—and the most misunderstood. Why we don't lead with it, and why it still matters.",
    tag: "Analysis",
    category: "Subjects",
  },
  {
    slug: "forgotten-1600s",
    title: "The Forgotten Seicento: Thinkers of the 1600s You Can't Read",
    date: "Dec 3, 2025",
    excerpt: "Kircher, Sennert, Weyer, Liceti. 324,690 Latin works from the Scientific Revolution—and the scholars behind them who remain untranslated.",
    tag: "Authors",
    category: "Authors",
  },
  {
    slug: "forgotten-1500s",
    title: "The Forgotten Cinquecento: Thinkers of the 1500s You Can't Read",
    date: "Dec 2, 2025",
    excerpt: "Zabarella, Cardano, della Porta, Telesio. The century of the Scientific Revolution—and the Latin authors who shaped it but remain inaccessible.",
    tag: "Authors",
    category: "Authors",
  },
  {
    slug: "forgotten-1400s",
    title: "The Forgotten Quattrocento: Thinkers of the 1400s You Can't Read",
    date: "Dec 1, 2025",
    excerpt: "Giorgio Valla, Giovanni Pontano, Paul of Venice. The 15th century gave us the Renaissance—and hundreds of Latin thinkers whose works remain untranslated.",
    tag: "Authors",
    category: "Authors",
  },
  {
    slug: "forgotten-authors",
    title: "The Forgotten Giants: Prolific Authors You've Never Heard Of",
    date: "Nov 30, 2025",
    excerpt: "Jakob Martini wrote 836 works. Johann Gerhard wrote 697. You've never read a word they wrote—because almost none of it has been translated.",
    tag: "Authors",
    category: "Authors",
  },
  {
    slug: "famous-humanists",
    title: "Even Ficino Isn't Fully Translated",
    date: "Nov 28, 2025",
    excerpt: "You'd think the famous Renaissance humanists would be fully available. They're not. Ficino, Pico, Valla—vast bodies of work remain untranslated.",
    tag: "Authors",
    category: "Authors",
  },
  {
    slug: "renaissance-bestsellers",
    title: "Renaissance Bestsellers Nobody Reads",
    date: "Nov 26, 2025",
    excerpt: "Some Latin books went through 100+ editions. They shaped European thought for centuries. Today, they're completely inaccessible.",
    tag: "Analysis",
    category: "History",
  },
  {
    slug: "translation-gap",
    title: "The Translation Gap: 95% of Latin Literature is Locked Away",
    date: "Nov 24, 2025",
    excerpt: "Only 416 Latin works ever appeared in Latin-English bilingual editions. The numbers reveal a staggering accessibility crisis.",
    tag: "Data",
    category: "Translations",
  },
  {
    slug: "hunting-for-translations",
    title: "Hunting for Translations: A Day Mapping the Latin-English Landscape",
    date: "Nov 22, 2025",
    excerpt: "How many Latin works have been translated into English? I catalogued 3,232 translation volumes across 45+ sources to find out. The coverage rates surprised me.",
    tag: "Methods",
    category: "Translations",
  },
  {
    slug: "mapping-translations",
    title: "Mapping the Translation Landscape: A Research Diary",
    date: "Nov 20, 2025",
    excerpt: "How do you count something that's never been counted? Building a comprehensive database of Latin-to-English translations—and discovering how much we don't know.",
    tag: "Methods",
    category: "Translations",
  },
  {
    slug: "rivers-of-esoteric-life",
    title: "Rivers of Esoteric Life: Mapping the Hermetic Tradition",
    date: "Nov 15, 2025",
    excerpt: "Applying Forlong's 'Rivers of Life' methodology to trace how Hermetica, alchemy, Kabbalah, and Rosicrucianism flowed through Renaissance publishing. Draft for discussion.",
    tag: "Draft",
    category: "Esoterica",
  },
  {
    slug: "methodology",
    title: "Methodology: How We Estimated Digitization Rates",
    date: "Nov 10, 2025",
    excerpt: "Documenting the sources and methods behind our accessibility estimates. How we derived the 18% digitized, 8% OCR, and 3% translated figures.",
    tag: "Methods",
    category: "Data",
  },
];

const tagColors: Record<string, { bg: string; text: string }> = {
  // Primary tags
  Research: { bg: '#f5f0e8', text: '#9e4a3a' },
  Vision: { bg: '#e8eef5', text: '#3a5a8a' },
  Mission: { bg: '#f5e8e8', text: '#9e4a3a' },
  Data: { bg: '#e8f0f5', text: '#546b8a' },
  Analysis: { bg: '#f5f0e8', text: '#8a6b3a' },
  Methods: { bg: '#e8f5e8', text: '#3a8a5a' },
  Authors: { bg: '#f0e8f5', text: '#6b3a8a' },
  Draft: { bg: '#f5f5f5', text: '#888' },
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Tools: { bg: '#e8eef5', text: '#3a5a8a' },
  Data: { bg: '#e8f0f5', text: '#546b8a' },
  History: { bg: '#f5f0e8', text: '#8a6b3a' },
  Authors: { bg: '#f0e8f5', text: '#6b3a8a' },
  Translations: { bg: '#e8f5e8', text: '#3a8a5a' },
  Esoterica: { bg: '#f5e8f0', text: '#8a3a6b' },
  Subjects: { bg: '#f5f5e8', text: '#6b6b3a' },
  Inventors: { bg: '#e8f0e8', text: '#3a6b5a' },
};

export default function BlogIndex() {
  return (
    <main style={{ background: '#fdfcf9', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid #e8e4dc',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: '800px',
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

      {/* Header */}
      <header style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px 40px',
      }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '42px',
          fontWeight: 400,
          color: '#1a1612',
          marginBottom: '16px',
        }}>
          Research Essays
        </h1>
        <p style={{
          fontFamily: 'Newsreader, Georgia, serif',
          fontSize: '19px',
          lineHeight: 1.6,
          color: '#555',
          marginBottom: '24px',
        }}>
          Exploring the hidden libraries of Renaissance Latin—data, methodology, and discoveries.
        </p>
        <Link href="/data" style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#9e4a3a',
          textDecoration: 'none',
        }}>
          See data visualizations →
        </Link>
      </header>

      {/* Pinned Posts */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px 32px',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: '#888',
          marginBottom: '16px',
        }}>
          FEATURED
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pinnedPosts.map((post) => {
            const colors = tagColors[post.tag] || tagColors.Analysis;
            return (
              <article
                key={post.slug}
                style={{
                  background: '#fff',
                  border: '2px solid #9e4a3a20',
                  borderRadius: '8px',
                  padding: '28px 32px',
                }}
              >
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: colors.bg,
                      color: colors.text,
                    }}>
                      {post.tag.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#aaa',
                    }}>{post.date}</span>
                  </div>
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '24px',
                    fontWeight: 500,
                    color: '#1a1612',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>
                  <p style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: '#666',
                  }}>{post.excerpt}</p>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* All Posts */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: '#888',
          marginBottom: '16px',
        }}>
          ALL ESSAYS ({posts.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => {
            const colors = tagColors[post.tag] || tagColors.Analysis;
            const catColors = categoryColors[post.category] || categoryColors.History;
            return (
              <article
                key={post.slug}
                style={{
                  background: '#fff',
                  border: '1px solid #e8e4dc',
                  borderRadius: '8px',
                  padding: '24px 28px',
                }}
              >
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: colors.bg,
                      color: colors.text,
                    }}>
                      {post.tag.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: catColors.bg,
                      color: catColors.text,
                    }}>
                      {post.category.toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#aaa',
                    }}>{post.date}</span>
                  </div>
                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#1a1612',
                    marginBottom: '4px',
                    lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>
                  <p style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: '15px',
                    lineHeight: 1.5,
                    color: '#777',
                  }}>{post.excerpt}</p>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

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
          Data from the <a href="https://ustc.ac.uk" style={{ color: '#666' }}>Universal Short Title Catalogue</a>, University of St Andrews
        </p>
      </footer>
    </main>
  );
}
