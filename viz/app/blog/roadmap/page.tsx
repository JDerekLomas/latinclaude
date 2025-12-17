"use client";

import Link from "next/link";

interface Work {
  author: string;
  title: string;
  date?: string;
  note?: string;
  illustrations?: string;
  length?: string;
}

interface ListSection {
  title: string;
  description: string;
  works: Work[];
}

const lists: Record<string, ListSection> = {
  foundation: {
    title: "The Foundation: Ficino",
    description: "Marsilio Ficino (1433-1499) translated the Renaissance into being. His Plato translations shaped European thought for centuries - but his own commentaries remain largely untranslated.",
    works: [
      { author: "Ficino", title: "Commentaries on Plato's Dialogues", date: "1469-1496", note: "Only Symposium commentary translated. Phaedrus, Republic, Timaeus, Parmenides unavailable." },
      { author: "Ficino", title: "Commentary on Plotinus's Enneads", date: "1492", note: "Shaped how Europe understood Neoplatonism. Completely untranslated." },
      { author: "Ficino", title: "De vita libri tres", date: "1489", note: "Partial translations exist. Full scholarly edition needed." },
    ]
  },
  famous_figures: {
    title: "Famous Figures: The Gaps",
    description: "Major untranslated works by well-known Renaissance thinkers. High name recognition, strong interest.",
    works: [
      { author: "Pico della Mirandola", title: "Disputationes adversus astrologiam", date: "1496", note: "His longest work. Influenced Kepler. Completely untranslated." },
      { author: "Pico della Mirandola", title: "900 Theses", date: "1486", note: "Farmer translation expensive. Needs open-access edition." },
      { author: "Giordano Bruno", title: "De immenso et innumerabilibus", date: "1591", note: "655 pages on infinite universe. Written before execution." },
      { author: "Giordano Bruno", title: "De monade, numero et figura", date: "1591", note: "Pythagorean number mysticism. ~150 pages." },
      { author: "Agrippa", title: "De incertitudine et vanitate scientiarum", date: "1526", note: "MORE popular than Occult Philosophy in his lifetime. 1569 English archaic." },
      { author: "Agrippa", title: "De nobilitate foeminei sexus", date: "1529", note: "Proto-feminist treatise. Short, accessible." },
      { author: "Robert Fludd", title: "Tractatus Apologeticus", date: "1617", note: "Defense of Rosicrucians. 196 pages. Good starting point." },
      { author: "Robert Fludd", title: "Utriusque Cosmi Historia (selections)", date: "1617-21", note: "Famous De Bry engravings. 2000+ pages total - needs selections." },
      { author: "Kircher", title: "Arithmologia", date: "1665", note: "Number mysticism. 301 pages. Feasible Kircher." },
      { author: "Kircher", title: "Iter Exstaticum Coeleste", date: "1656", note: "Cosmic voyage through heavens. Dialogue format." },
    ]
  },
  curiosities: {
    title: "Renaissance Curiosities",
    description: "Fascinating illustrated works with crossover appeal - monsters, machines, unicorns, witchcraft, and wonders.",
    works: [
      { author: "Lycosthenes", title: "Prodigiorum ac ostentorum chronicon", date: "1557", illustrations: "~1,500 monster woodcuts", note: "Chronicle of prodigies. Influenced Nostradamus." },
      { author: "Aldrovandi", title: "Monstrorum historia", date: "1642", illustrations: "~450 woodcuts", note: "Dragons, mythical races. Founder of natural history." },
      { author: "Veranzio", title: "Machinae novae", date: "1615", illustrations: "49 plates", note: "First printed parachute. SHORT." },
      { author: "Besson", title: "Theatrum instrumentorum et machinarum", date: "1578", illustrations: "60 engraved plates", note: "War machines, instruments. Beautifully illustrated." },
      { author: "Bartholin", title: "De unicornu observationes novae", date: "1678", illustrations: "20+ engravings", note: "Comprehensive unicorn treatise. High popular appeal." },
      { author: "Trithemius", title: "Steganographia", date: "1606", note: "Appears to be angel magic, actually cryptography. On Index 1609-1900." },
      { author: "Guazzo", title: "Compendium maleficarum", date: "1608", illustrations: "33 woodcuts", note: "Most illustrated witchcraft manual. Sabbath scenes." },
      { author: "Kircher", title: "Ars Magna Lucis et Umbrae", date: "1646", illustrations: "38 plates", note: "First magic lantern description. Foundational for cinema." },
      { author: "Apian", title: "Astronomicum Caesareum", date: "1540", illustrations: "21 volvelles, 58 woodcuts", note: "Paper computers. Dragon diagrams. Spectacular." },
      { author: "Barozzi", title: "Rithmomachia", date: "1572", note: "The Philosopher's Game - medieval mathematical board game." },
      { author: "Horapollo", title: "Hieroglyphica", date: "1505", illustrations: "195 woodcuts", note: "Wrong about hieroglyphics but hugely influential." },
    ]
  },
  natural_philosophy: {
    title: "Natural Philosophy & Early Science",
    description: "Where Renaissance magic meets emerging science. Illustrated treatises on optics, magnetism, and nature.",
    works: [
      { author: "Della Porta", title: "Magia naturalis libri XX", date: "1589", note: "Most influential natural magic text. 1658 English outdated." },
      { author: "Della Porta", title: "De humana physiognomonia", date: "1586", note: "Famous human-animal comparison woodcuts." },
      { author: "Cardano", title: "De subtilitate rerum", date: "1550", note: "21 books on nature. Major gap in history of science." },
      { author: "Gilbert", title: "De Magnete", date: "1600", note: "First scientific study of magnetism. Diagrams of terrella experiments." },
      { author: "Libavius", title: "Alchemia", date: "1597", note: "First systematic chemistry textbook." },
      { author: "Severinus", title: "Idea medicinae philosophicae", date: "1571", note: "THE systematization of Paracelsus. Completely untranslated." },
      { author: "Vesalius", title: "De humani corporis fabrica", date: "1543", illustrations: "200+ woodcuts", note: "Translation exists but expensive. Needs open-access." },
      { author: "Tycho Brahe", title: "Astronomiae instauratae mechanica", date: "1598", illustrations: "21 hand-colored", note: "Instrument illustrations. Only 60-100 copies made." },
    ]
  },
  hermetica: {
    title: "Hermetica & Kabbalah",
    description: "The esoteric tradition - Hermetic philosophy, Christian Kabbalah, and prisca theologia.",
    works: [
      { author: "Patrizi", title: "Nova de universis philosophia", date: "1591", note: "Major Hermetic cosmology. Hermes, Zoroaster, Orpheus." },
      { author: "Steuco", title: "De perenni philosophia", date: "1540", note: "Coined 'philosophia perennis' - later Leibniz, Huxley." },
      { author: "Reuchlin", title: "De verbo mirifico", date: "1494", note: "First Christian Kabbalistic work. Wonder-working word." },
      { author: "Giorgi", title: "De harmonia mundi", date: "1525", note: "Pythagorean harmony + Kabbalah. Influenced Dee, Fludd." },
      { author: "Khunrath", title: "Amphitheatrum Sapientiae Aeternae", date: "1595", note: "Famous Laboratory-Oratory engravings. Difficult Latin." },
      { author: "Maier", title: "Atalanta fugiens", date: "1617", illustrations: "50 emblems + fugues", note: "Alchemical emblem book with music. Fresh edition needed." },
    ]
  },
  alchemy: {
    title: "Alchemy & Rosicruciana",
    description: "The chemical philosophy and Rosicrucian movement.",
    works: [
      { author: "Schweighardt", title: "Speculum Sophicum Rhodo-Stauroticum", date: "1618", note: "Key Rosicrucian text. Famous 'Collegium' engraving. SHORT." },
      { author: "Fludd", title: "Philosophia Moysaica", date: "1638", note: "Mosaic philosophy. More feasible than Utriusque Cosmi." },
      { author: "Sennert", title: "De chymicorum consensu ac dissensu", date: "1619", note: "Reconciling Paracelsus with Aristotle. Influenced Boyle." },
    ]
  }
};

export default function RoadmapPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdfcf9', color: '#1a1612' }}>
      <header style={{ borderBottom: '1px solid #e8e4dc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/blog" style={{ color: '#9e4a3a', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            &larr; RESEARCH ESSAYS
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
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontSize: '42px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '16px' }}>
          Translation Roadmap
        </h1>
        <p style={{ fontSize: '20px', fontFamily: 'Newsreader, serif', color: '#444', marginBottom: '48px', lineHeight: 1.6 }}>
          Prioritized Latin works for translation. Less than 3% of Renaissance Latin literature
          has ever been translated into English. These are the gaps that matter most.
        </p>

        {Object.entries(lists).map(([key, section]) => (
          <section key={key} style={{ marginBottom: '56px' }}>
            <h2 style={{
              fontSize: '28px',
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#1a1612'
            }}>
              {section.title}
            </h2>
            <p style={{
              fontSize: '16px',
              fontFamily: 'Newsreader, serif',
              color: '#666',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              {section.description}
            </p>

            <ol style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {section.works.map((work, idx) => (
                <li key={idx} style={{
                  padding: '16px 20px',
                  background: '#fff',
                  border: '1px solid #e8e4dc',
                  borderRadius: '6px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1a1612'
                    }}>
                      {work.author}, <em>{work.title}</em>
                    </span>
                    {work.date && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#888'
                      }}>
                        {work.date}
                      </span>
                    )}
                  </div>
                  {work.illustrations && (
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      color: '#9e4a3a',
                      marginBottom: '4px'
                    }}>
                      {work.illustrations}
                    </div>
                  )}
                  {work.note && (
                    <div style={{
                      fontFamily: 'Newsreader, serif',
                      fontSize: '15px',
                      color: '#666',
                      lineHeight: 1.4
                    }}>
                      {work.note}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid #e8e4dc' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '16px', color: '#444' }}>
            Not on This List
          </h2>
          <div style={{ fontSize: '15px', fontFamily: 'Newsreader, serif', color: '#666', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px' }}><strong>Already well-served:</strong> Cicero, Ovid, Virgil (Loeb); Augustine (multiple series); Erasmus major works (CWE); Thomas Aquinas.</p>
            <p style={{ marginBottom: '12px' }}><strong>Ongoing projects elsewhere:</strong> Johann Gerhard (Concordia, 17 vols); Melanchthon (Newcomb 2022+); Vives (Brill series).</p>
            <p><strong>Too large for solo work:</strong> Bartolus complete commentaries; Calov Systema (12 vols); complete systematic theologies.</p>
          </div>
        </section>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e8e4dc' }}>
          <Link href="/blog/methodology" style={{ color: '#9e4a3a', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            &larr; View full methodology
          </Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e8e4dc', padding: '32px 0', textAlign: 'center', color: '#888', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
        <p>
          Data from{" "}
          <a href="https://www.ustc.ac.uk/" style={{ color: '#9e4a3a', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
            USTC
          </a>
          {" "}| For{" "}
          <a href="https://sourcelibrary.org" style={{ color: '#9e4a3a', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
            SourceLibrary.org
          </a>
        </p>
      </footer>
    </div>
  );
}
