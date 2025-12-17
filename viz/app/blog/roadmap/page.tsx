"use client";

import Link from "next/link";

interface Work {
  author: string;
  title: string;
  date?: string;
  publisher?: string;
  note?: string;
  illustrations?: string;
  length?: string;
  link?: string;
}

interface ListSection {
  title: string;
  description: string;
  works: Work[];
}

const lists: Record<string, ListSection> = {
  foundation: {
    title: "The Foundation: Ficino",
    description: "Marsilio Ficino (1433-1499) translated the Renaissance into being. His translations of Plato, Plotinus, and the Hermetic corpus shaped European thought for centuries - but most of his own commentaries and original works remain untranslated.",
    works: [
      { author: "Ficino", title: "Commentaries on Plato's Dialogues", date: "1484", publisher: "Florence: Lorenzo de'Medici / Laurentius de Alopa", note: "Only Symposium commentary translated (Jayne). Phaedrus, Republic, Timaeus, Parmenides, Laws commentaries unavailable.", link: "https://archive.org/details/bub_gb_ucju1UXVU9UC" },
      { author: "Ficino", title: "Commentary on Plotinus's Enneads", date: "1492", publisher: "Florence: Antonio Miscomini", note: "Shaped how Europe understood Neoplatonism for centuries. Completely untranslated.", link: "https://archive.org/details/plotinioperaomn00chumgoog" },
      { author: "Ficino", title: "De mysteriis Aegyptiorum (on Iamblichus)", date: "1497", publisher: "Venice: Aldus Manutius", note: "Ficino's interpretive summary of Iamblichus on theurgy - not just a translation. He gave the work its famous title.", link: "https://archive.org/details/ARes113171" },
      { author: "Ficino", title: "Theologia Platonica", date: "1482", publisher: "Florence: Antonio Miscomini", note: "His masterwork on the immortality of the soul. I Tatti translation exists (Allen/Hankins) but expensive. Open-access needed.", link: "https://archive.org/details/ARes113171" },
      { author: "Ficino", title: "De vita libri tres", date: "1489", publisher: "Florence: Antonio Miscomini", note: "Three Books on Life - astral magic and medicine. Kaske/Clark translation exists but scholarly apparatus dated.", link: "https://archive.org/details/hin-wel-all-00000632-001" },
      { author: "Ficino", title: "De Christiana religione", date: "1474", publisher: "Florence: Niccolò di Lorenzo della Magna", note: "On the Christian Religion. His defense of Christianity through Platonic philosophy. Completely untranslated.", link: "https://archive.org/details/ita-bnc-in1-00000736-001" },
      { author: "Ficino", title: "Consiglio contro la pestilenzia", date: "1481", publisher: "Florence: Bartolomeo de' Libri", note: "Advice against the Plague. Medical treatise combining Platonic philosophy with practical medicine. Latin ed. Augsburg 1518.", link: "https://archive.org/details/ita-bnc-in2-00002106-001" },
      { author: "Ficino", title: "Epistolae (Letters)", date: "1495", publisher: "Venice: Matteo Capcasa", note: "12 books of letters - philosophical correspondence with all of Europe. Only selections translated.", link: "https://archive.org/details/ARes113171" },
      { author: "Ficino", title: "Opera Omnia", date: "1576", publisher: "Basel: Henricus Petrina", note: "Complete works in 2 folio volumes. The standard edition for all Ficino scholarship.", link: "https://archive.org/details/bub_gb_89T2Qk6Bl6gC" },
    ]
  },
  famous_figures: {
    title: "Famous Figures: The Gaps",
    description: "Major untranslated works by well-known Renaissance thinkers. High name recognition, strong interest.",
    works: [
      { author: "Pico della Mirandola", title: "Disputationes adversus astrologiam divinatricem", date: "1496", publisher: "Bologna: Benedictus Hectoris (posthumous)", note: "His longest work (12 books). Influenced Kepler. Completely untranslated.", link: "https://archive.org/details/ita-bnc-in2-00000844-001" },
      { author: "Pico della Mirandola", title: "Conclusiones DCCCC (900 Theses)", date: "1486", publisher: "Rome: Eucharius Silber", note: "Farmer translation (1998) expensive. Needs open-access edition.", link: "https://archive.org/details/ita-bnc-in2-00000839-001" },
      { author: "Giordano Bruno", title: "De immenso et innumerabilibus", date: "1591", publisher: "Frankfurt: Johann Wechel & Peter Fischer", note: "655 pages on infinite universe. Written before his execution.", link: "https://archive.org/details/jordanibruninol00teleungoog" },
      { author: "Giordano Bruno", title: "De monade, numero et figura", date: "1591", publisher: "Frankfurt: Johann Wechel & Peter Fischer", note: "Pythagorean number mysticism. ~150 pages. More feasible.", link: "https://archive.org/details/jordanibruninol00teleungoog" },
      { author: "Agrippa", title: "De incertitudine et vanitate scientiarum", date: "1530", publisher: "Antwerp: Johannes Grapheus", note: "MORE popular than Occult Philosophy in his lifetime. 1569 English archaic.", link: "https://archive.org/details/bub_gb_Up0-AAAAcAAJ" },
      { author: "Agrippa", title: "De nobilitate et praecellentia foeminei sexus", date: "1529", publisher: "Antwerp: Michael Hillenius", note: "Proto-feminist treatise. Short, accessible.", link: "https://archive.org/details/bub_gb_kBUVAAAAQAAJ" },
      { author: "Robert Fludd", title: "Tractatus Apologeticus", date: "1617", publisher: "Leiden: Godefridus Basson", note: "Defense of Rosicrucians. 196 pages. Good starting point.", link: "https://archive.org/details/tractatusapolog00fludgoog" },
      { author: "Robert Fludd", title: "Utriusque Cosmi Historia", date: "1617-21", publisher: "Oppenheim: Johann Theodore de Bry", note: "Famous De Bry engravings. 2000+ pages - needs selections.", link: "https://archive.org/details/utriaborvm00flud" },
      { author: "Kircher", title: "Arithmologia", date: "1665", publisher: "Rome: Varesii", note: "Number mysticism. 301 pages. Feasible Kircher.", link: "https://archive.org/details/bub_gb_OMJhkVHUtPIC" },
      { author: "Kircher", title: "Iter Exstaticum Coeleste", date: "1656", publisher: "Rome: Vitalis Mascardi", note: "Cosmic voyage through heavens. Dialogue format.", link: "https://archive.org/details/bub_gb_TnNSAAAAcAAJ" },
    ]
  },
  curiosities: {
    title: "Renaissance Curiosities",
    description: "Fascinating illustrated works with crossover appeal - monsters, machines, unicorns, witchcraft, and wonders.",
    works: [
      { author: "Lycosthenes", title: "Prodigiorum ac ostentorum chronicon", date: "1557", publisher: "Basel: Henricus Petri", illustrations: "~1,500 woodcuts", note: "Chronicle of prodigies from Creation to 1557.", link: "https://archive.org/details/prolodigiorum00lyco" },
      { author: "Aldrovandi", title: "Monstrorum historia", date: "1642", publisher: "Bologna: Nicolò Tebaldini (posthumous)", illustrations: "~450 woodcuts", note: "Dragons, mythical races. Founder of natural history.", link: "https://archive.org/details/vlyssisaldrouan00aldra" },
      { author: "Veranzio", title: "Machinae novae", date: "1615", publisher: "Venice: s.n.", illustrations: "49 plates", note: "First printed parachute ('Homo Volans'). SHORT.", link: "https://archive.org/details/gri_33125012287849" },
      { author: "Besson", title: "Theatrum instrumentorum et machinarum", date: "1578", publisher: "Lyon: Barthélemy Vincent", illustrations: "60 engraved plates", note: "War machines, instruments. Du Cerceau engravings.", link: "https://archive.org/details/theatruminstrum00bess" },
      { author: "Bartholin", title: "De unicornu observationes novae", date: "1678", publisher: "Amsterdam: Henricus Wetstein", illustrations: "20+ engravings", note: "Comprehensive unicorn treatise by Romeyn de Hooghe.", link: "https://archive.org/details/gri_thomaebartho00bart" },
      { author: "Trithemius", title: "Steganographia", date: "1606", publisher: "Frankfurt: Johann Berner", note: "Appears to be angel magic, actually cryptography. On Index 1609-1900.", link: "https://archive.org/details/SteganographiaBSB1608" },
      { author: "Guazzo", title: "Compendium maleficarum", date: "1608", publisher: "Milan: Collegium Ambrosianum", illustrations: "33 woodcuts", note: "Most illustrated witchcraft manual. Sabbath scenes.", link: "https://archive.org/details/compendiummalefi00guaz" },
      { author: "Kircher", title: "Ars Magna Lucis et Umbrae", date: "1646", publisher: "Rome: Lodovico Grignani", illustrations: "38 plates", note: "First magic lantern description. Foundational for cinema.", link: "https://archive.org/details/bub_gb_x3NOAAAAYAAJ" },
      { author: "Apian", title: "Astronomicum Caesareum", date: "1540", publisher: "Ingolstadt: Peter Apian", illustrations: "21 volvelles, 58 woodcuts", note: "Paper computers. Dragon diagrams. Spectacular.", link: "https://archive.org/details/astronomicumcsar00apia" },
      { author: "Barozzi", title: "Il nobilissimo giuoco de Rithmomachia", date: "1572", publisher: "Venice: Gratioso Perchacino", note: "The Philosopher's Game - medieval mathematical board game." },
      { author: "Horapollo", title: "Hieroglyphica", date: "1505", publisher: "Venice: Aldus Manutius", illustrations: "195 woodcuts (1543 ed.)", note: "Wrong about hieroglyphics but hugely influential.", link: "https://archive.org/details/hieroglyphicahor00hora" },
    ]
  },
  natural_philosophy: {
    title: "Natural Philosophy & Early Science",
    description: "Where Renaissance magic meets emerging science. Illustrated treatises on optics, magnetism, and nature.",
    works: [
      { author: "Della Porta", title: "Magiae naturalis libri XX", date: "1589", publisher: "Naples: Horatius Salvianus", note: "Most influential natural magic text. 1658 English outdated.", link: "https://archive.org/details/hin-wel-all-00002756-001" },
      { author: "Della Porta", title: "De humana physiognomonia", date: "1586", publisher: "Vico Equense: Joseph Cacchius", note: "Famous human-animal comparison woodcuts.", link: "https://archive.org/details/bub_gb_B81RAAAAcAAJ" },
      { author: "Cardano", title: "De subtilitate rerum", date: "1550", publisher: "Nuremberg: Johann Petreius", note: "21 books on nature. Major gap in history of science.", link: "https://archive.org/details/bub_gb_u3c8AAAAcAAJ" },
      { author: "Gilbert", title: "De Magnete", date: "1600", publisher: "London: Peter Short", note: "First scientific study of magnetism. Terrella diagrams.", link: "https://archive.org/details/1600-william-gilbert-de-magnete" },
      { author: "Libavius", title: "Alchemia", date: "1597", publisher: "Frankfurt: Johann Saur", note: "First systematic chemistry textbook.", link: "https://archive.org/details/bub_gb_Y8hDAAAAcAAJ" },
      { author: "Severinus", title: "Idea medicinae philosophicae", date: "1571", publisher: "Basel: Sixtus Henricpetri", note: "THE systematization of Paracelsus. Completely untranslated.", link: "https://archive.org/details/bub_gb_QbdSAAAAcAAJ" },
      { author: "Vesalius", title: "De humani corporis fabrica", date: "1543", publisher: "Basel: Johannes Oporinus", illustrations: "200+ woodcuts", note: "Richardson/Carman translation expensive. Open-access needed.", link: "https://archive.org/details/hin-wel-all-00001350-001" },
      { author: "Tycho Brahe", title: "Astronomiae instauratae mechanica", date: "1598", publisher: "Wandesburg: Levinus Hulsius", illustrations: "21 hand-colored", note: "Instrument illustrations. Only 60-100 copies made.", link: "https://archive.org/details/TychonisBraheAs00BrahA" },
    ]
  },
  hermetica: {
    title: "Hermetica & Kabbalah",
    description: "The esoteric tradition - Hermetic philosophy, Christian Kabbalah, and prisca theologia.",
    works: [
      { author: "Patrizi", title: "Nova de universis philosophia", date: "1591", publisher: "Ferrara: Benedictus Mammarellus", note: "Major Hermetic cosmology. Hermes, Zoroaster, Orpheus.", link: "https://archive.org/details/bub_gb_m7zxoNH8OAcC" },
      { author: "Steuco", title: "De perenni philosophia libri X", date: "1540", publisher: "Lyon: Sébastien Gryphe", note: "Coined 'philosophia perennis' - later Leibniz, Huxley.", link: "https://archive.org/details/bub_gb_Dz5pAAAAcAAJ" },
      { author: "Reuchlin", title: "De verbo mirifico", date: "1494", publisher: "Basel: Johann Amerbach", note: "First Christian Kabbalistic work. Wonder-working word.", link: "https://archive.org/details/bub_gb_WYJXAAAAcAAJ" },
      { author: "Giorgi", title: "De harmonia mundi totius", date: "1525", publisher: "Venice: Bernardino de Vitali", note: "Pythagorean harmony + Kabbalah. Influenced Dee, Fludd.", link: "https://archive.org/details/bub_gb_dshAAAAAcAAJ" },
      { author: "Khunrath", title: "Amphitheatrum Sapientiae Aeternae", date: "1595", publisher: "Hamburg: s.n. (expanded ed. 1609)", note: "Famous Laboratory-Oratory engravings. Difficult Latin.", link: "https://archive.org/details/amphitheatrumsap00khun" },
      { author: "Maier", title: "Atalanta fugiens", date: "1617", publisher: "Oppenheim: Johann Theodore de Bry", illustrations: "50 emblems + fugues", note: "Alchemical emblem book with music.", link: "https://archive.org/details/atalantafvgiens00maie" },
    ]
  },
  alchemy: {
    title: "Alchemy & Rosicruciana",
    description: "The chemical philosophy and Rosicrucian movement.",
    works: [
      { author: "Schweighardt", title: "Speculum Sophicum Rhodo-Stauroticum", date: "1618", publisher: "s.l.: s.n.", note: "Key Rosicrucian text. Famous 'Collegium' engraving. SHORT.", link: "https://archive.org/details/speculumsophicum00schw" },
      { author: "Fludd", title: "Philosophia Moysaica", date: "1638", publisher: "Gouda: Petrus Rammazenius", note: "Mosaic philosophy. More feasible than Utriusque Cosmi.", link: "https://archive.org/details/philosophiamosai00flud" },
      { author: "Sennert", title: "De chymicorum consensu ac dissensu", date: "1619", publisher: "Wittenberg: Zacharias Schurer", note: "Reconciling Paracelsus with Aristotle. Influenced Boyle.", link: "https://archive.org/details/bub_gb_QOFJAAAAcAAJ" },
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
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1a1612'
                    }}>
                      {work.author}, <em>{work.title}</em>
                    </span>
                    {(work.date || work.publisher) && (
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#888',
                        marginTop: '2px'
                      }}>
                        {work.publisher}{work.publisher && work.date ? ', ' : ''}{work.date}
                      </div>
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
                  {work.link && (
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        color: '#9e4a3a',
                        textDecoration: 'none',
                        marginTop: '8px',
                        display: 'inline-block'
                      }}
                    >
                      View on Internet Archive →
                    </a>
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
