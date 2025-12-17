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
  },
  machines_and_mind: {
    title: "Mind, Memory & Machines",
    description: "Precursors to artificial intelligence - combinatorics, automata, artificial memory, universal languages, and early cognitive science.",
    works: [
      { author: "Ramon Llull", title: "Ars Magna", date: "1305 (printed 1480)", publisher: "Rome: [various early eds.]", note: "The foundation of combinatorial logic. Rotating discs generate all concept combinations. Leibniz cited as inspiration for calculus ratiocinator.", link: "https://archive.org/details/bub_gb_k334cEAvl5gC" },
      { author: "Giordano Bruno", title: "De umbris idearum", date: "1582", publisher: "Paris: Aegidius Gorbinus", note: "Artificial memory through combinatorial image generation. Mechanical method for producing mental representations.", link: "https://archive.org/details/gri_iordanusbrun00brun" },
      { author: "Giordano Bruno", title: "De imaginum, signorum et idearum compositione", date: "1591", publisher: "Frankfurt: Johann Wechel", note: "His most elaborate memory system. Combination of images and signs for artificial cognition.", link: "https://archive.org/details/jordanibruninol00teleungoog" },
      { author: "Kircher", title: "Polygraphia nova et universalis", date: "1663", publisher: "Rome: Varesii", note: "Universal language with combinatorial rules. Pasigraphy - writing understood by all nations.", link: "https://archive.org/details/bub_gb_YRJhTpqLoBkC" },
      { author: "Kircher", title: "Musurgia universalis", date: "1650", publisher: "Rome: Francesco Corbelletti", note: "Contains the ARCA MUSARITHMICA - a mechanical device for automatic musical composition. First algorithmic composition.", link: "https://archive.org/details/chepfl-lipr-AXC19_02" },
      { author: "Leibniz", title: "Dissertatio de arte combinatoria", date: "1666", publisher: "Leipzig: Johann Simon Fick", note: "Explicitly builds on Llull. Outlines the 'calculus ratiocinator' - a universal reasoning machine. Foundation of computer science.", link: "https://archive.org/details/ita-bnc-mag-00000844-001" },
      { author: "Vives", title: "De anima et vita libri tres", date: "1538", publisher: "Basel: Robert Winter", note: "First empirical psychology. Studies cognition, memory, emotions. Major influence on Descartes.", link: "https://archive.org/details/bub_gb_aBC8-gbrqwUC" },
      { author: "Ramus", title: "Dialecticae libri duo", date: "1556", publisher: "Paris: Andreas Wechel", note: "Reformed logic and method. Dichotomous classification trees - precursor to decision trees.", link: "https://archive.org/details/per_british-and-continental-rhetoric-and-elocution_p-rami-dialecticae-libri-duo_ramus-pe_1560" },
      { author: "Albertus Magnus", title: "De mineralibus", date: "c.1260 (printed 1518)", publisher: "Cologne: Johann Birckmann", note: "Contains the legend of his TALKING HEAD - an automaton that could answer questions. Medieval AI folklore.", link: "https://archive.org/details/sucho-id-alberti-magni-philosophorum-maximi-de-mineralibus-libri-quinque" },
      { author: "Hero of Alexandria", title: "Spiritalia (Pneumatica)", date: "1st c. CE (Latin 1575)", publisher: "Urbino: Federico Commandino (trans.)", note: "Ancient automata - self-opening doors, mechanical birds, coin-operated machines. Renaissance engineers studied this.", link: "https://archive.org/details/heronisspirital00herogoog" },
      { author: "Agrippa", title: "De occulta philosophia (Book III)", date: "1533", publisher: "Cologne: Johann Soter", note: "Book III on ceremonial magic includes theory of 'artificial spirits' and animated statues.", link: "https://archive.org/details/bub_gb_YMVLAAAAcAAJ" },

      // NEOPLATONIST WORKS ON MIND/NOUS
      { author: "Plotinus", title: "Enneads (Ficino trans.)", date: "1492", publisher: "Florence: Antonio Miscomini", note: "First Latin Plotinus. Theory of NOUS (divine intellect), emanation, levels of consciousness. Foundation of Renaissance psychology.", link: "https://archive.org/details/plotiniopera01plgoog" },
      { author: "Proclus", title: "Institutio Theologica", date: "1482 (Ficino trans.)", publisher: "Florence: Antonio Miscomini", note: "Elements of Theology. Henads, divine intellect, chain of being. Hierarchical model of mind and reality.", link: "https://archive.org/details/hin-wel-all-00001265-001" },
      { author: "Iamblichus", title: "De mysteriis Aegyptiorum", date: "1497 (Ficino trans.)", publisher: "Venice: Aldus Manutius", note: "THEURGIC ANIMATION OF STATUES. How divine spirit can be invoked into material objects. Artificial ensoulment.", link: "https://archive.org/details/hin-wel-all-00001265-001" },
      { author: "Ficino", title: "Theologia Platonica", date: "1482", publisher: "Florence: Antonio Miscomini", note: "18 books on immortality of soul. Levels of consciousness from matter to God. Renaissance psychology's masterwork.", link: "https://archive.org/details/ita-bnc-in2-00001718-002" },
      { author: "Cusanus", title: "De docta ignorantia", date: "1440 (printed 1488)", publisher: "Strasbourg: Martin Flach", note: "LEARNED IGNORANCE - limits of human cognition. Infinite mind, coincidentia oppositorum. Proto-epistemology.", link: "https://archive.org/details/cusanus-nicolaus-de-docta-ignorantia" },
      { author: "Porphyry", title: "Isagoge (with Aristotle's Organon)", date: "1495-98", publisher: "Venice: Aldus Manutius", note: "Introduction to categories. The TREE OF PORPHYRY - first hierarchical classification. Precursor to taxonomies and ontologies.", link: "https://archive.org/details/opera05aris" },

      // ALCHEMICAL WORKS ON ARTIFICIAL LIFE
      { author: "Hermes Trismegistus", title: "Asclepius", date: "1471 (Ficino trans.)", publisher: "Treviso: Gerardus de Lisa", note: "ANIMATED STATUES - 'gods made by man'. Artificial ensoulment through theurgy. Most explicit ancient text on creating artificial beings.", link: "https://archive.org/details/hermetica" },
      { author: "Turba Philosophorum", title: "Auriferae artis (Turba)", date: "1572", publisher: "Basel: Petrus Perna", note: "Council of ancient philosophers debating alchemy. Transmutation of matter AND mind. Arabic-Latin compilation.", link: "https://archive.org/details/hin-wel-all-00002160-001" },
      { author: "Paracelsus", title: "Archidoxis magicae", date: "1570", publisher: "Basel: Petrus Perna", note: "Contains recipe for HOMUNCULUS - artificial human created in alchemical vessel. Most famous artificial life text.", link: "https://archive.org/details/paracelsus-archidoxis-magicae" },
      { author: "Michael Maier", title: "Atalanta Fugiens", date: "1617", publisher: "Oppenheim: Johann Theodor de Bry", note: "50 alchemical EMBLEMS with music. Multimedia alchemy - image, text, fugue. Transformation of matter and consciousness.", link: "https://archive.org/details/atalanta-fugiens-michael-maier" },

      { author: "Salomon de Caus", title: "Les raisons des forces mouvantes", date: "1615", publisher: "Frankfurt: Jan Norton", note: "Garden automata, mechanical birds, grottoes with moving figures. Influenced European court gardens.", link: "https://archive.org/details/ldpd_6429555_000" },
      { author: "Caspar Schott", title: "Magia universalis naturae et artis", date: "1657-59", publisher: "Würzburg: Heinrich Pigrin", note: "Kircher's student. 4 vols on optics, acoustics, mathematics, physics. Automata and mechanical devices.", link: "https://archive.org/details/bub_gb_tI0oTeeUzg0C" },
      { author: "Descartes", title: "De homine (Traité de l'homme)", date: "1662", publisher: "Leiden: Moyardus & Leffen (posthumous)", note: "The body as machine. Mechanistic physiology - nerves as pipes, brain as hydraulic system.", link: "https://archive.org/details/descartesrenetr00desc" },
      { author: "Pomponazzi", title: "De immortalitate animae", date: "1516", publisher: "Bologna: Giustiniano da Rubiera", note: "Denied immortality of soul on Aristotelian grounds. Caused scandal. Proto-materialist.", link: "https://archive.org/details/bub_gb_lmgme9cnK6AC" },
      { author: "Telesio", title: "De rerum natura iuxta propria principia", date: "1586", publisher: "Naples: Horatius Salvianus", note: "Anti-Aristotelian naturalism. Nature explained by heat/cold, not forms. Influenced Bacon.", link: "https://archive.org/details/bub_gb_zRYhb55j_LoC" },
      { author: "Wilkins", title: "Essay towards a Real Character", date: "1668", publisher: "London: Royal Society", note: "Universal philosophical language. Systematic classification of all concepts. Influenced Leibniz.", link: "https://archive.org/details/AnEssayTowardsARealCharacterAndAPhilosophicalLanguage" },
      { author: "Romberch", title: "Congestorium artificiosae memoriae", date: "1520", publisher: "Venice: Melchior Sessa", note: "Memory palace technique systematized. Visual encoding of information. Precursor to data structures.", link: "https://archive.org/details/hin-wel-all-00002875-001" },
      { author: "Publicius", title: "Ars memorativa", date: "1482", publisher: "Venice: Erhard Ratdolt", note: "First PRINTED memory treatise. Woodcut diagrams of memory systems.", link: "https://archive.org/details/arsmemoria00publ" },
      { author: "Napier", title: "Rabdologiae", date: "1617", publisher: "Edinburgh: Andrew Hart", note: "Napier's Bones - calculating rods for multiplication. First practical calculating device. Also describes 'local arithmetic' (binary!).", link: "https://archive.org/details/rabdologiaseunu00napi" },
      { author: "Ramelli", title: "Le diverse et artificiose machine", date: "1588", publisher: "Paris: Author", illustrations: "195 engraved plates", note: "Famous machine book. Reading wheel (bookwheel), pumps, cranes. Influenced all later machine treatises.", link: "https://archive.org/details/gri_33125009356607" },
      { author: "Zonca", title: "Novo teatro di machine et edificii", date: "1607", publisher: "Padua: Pietro Bertelli", illustrations: "42 plates", note: "Italian machine theater. Mills, presses, hydraulics.", link: "https://archive.org/details/chepfl-lipr-AXC5" },
      { author: "Gómez Pereira", title: "Antoniana Margarita", date: "1554", publisher: "Medina del Campo: Guillermo de Millis", note: "ARGUED ANIMALS ARE AUTOMATA - 90 years before Descartes! Spanish physician's radical mechanicism.", link: "https://archive.org/details/antonianamargar00peregoog" },
      { author: "Della Porta", title: "De furtivis literarum notis", date: "1563", publisher: "Naples: Johannes Maria Scotus", note: "First modern book on CRYPTOGRAPHY. Substitution ciphers, polyalphabetic systems.", link: "https://archive.org/details/bub_gb_sc-Zaq8_jFIC" },
      { author: "Witelo", title: "Perspectiva", date: "c.1275 (printed 1535)", publisher: "Nuremberg: Johannes Petreius", note: "Medieval optics synthesizing Alhazen. Theory of vision and perception. 10 books.", link: "https://archive.org/details/ARes41201" },
      { author: "Bacon", title: "Novum Organum", date: "1620", publisher: "London: John Bill", note: "New method of scientific induction. Tables and exclusions - precursor to data analysis.", link: "https://archive.org/details/novumorganum00bacouoft" },
      { author: "Boole", title: "Laws of Thought", date: "1854", publisher: "London: Walton & Maberly", note: "Boolean algebra - foundation of digital computing. 'An Investigation of the Laws of Thought'.", link: "https://archive.org/details/bub_gb_pFsmwHjdHSsC" },
      { author: "Hobbes", title: "De Corpore", date: "1655", publisher: "London: Andrew Crooke", note: "Mechanistic philosophy. 'Reasoning is but reckoning' - computation as thought.", link: "https://archive.org/details/decorporeeleme00hobb" },
      { author: "La Mettrie", title: "L'Homme Machine", date: "1747", publisher: "Leiden: Elie Luzac", note: "Man a Machine - radical materialist treatise. Extends Descartes to humans.", link: "https://archive.org/details/lhommemachine00lame" },
      { author: "Leibniz", title: "Explication de l'Arithmétique Binaire", date: "1703", publisher: "Paris: Mémoires de l'Académie Royale", note: "BINARY ARITHMETIC explained. Connected to I Ching. Foundation of digital computing.", link: "https://archive.org/details/maborvm00teleungoog" },
      { author: "al-Jazari", title: "Kitab fi ma'rifat al-hiyal al-handasiyya", date: "1206", publisher: "[Book of Ingenious Devices]", note: "Islamic AUTOMATA - water clocks, musical robots, hand-washing peacock. Programmable mechanisms.", link: "https://archive.org/details/cover_20200113_2057" },
      { author: "Frege", title: "Begriffsschrift", date: "1879", publisher: "Halle: Louis Nebert", note: "First formal logic system. Predicate calculus - foundation of programming languages and AI.", link: "https://archive.org/details/11388662" },
      { author: "Babbage", title: "On the Economy of Machinery and Manufactures", date: "1832", publisher: "London: Charles Knight", note: "Division of labor applied to calculation. Led to Analytical Engine concept.", link: "https://archive.org/details/oneconomyofmachi00babbrich" },
      { author: "Jevons", title: "On the Mechanical Performance of Logical Inference", date: "1870", publisher: "London: Royal Society", note: "The LOGIC PIANO - first machine to perform logical operations. Predecessor to logic gates.", link: "https://archive.org/details/philtrans07444139" },
      { author: "Peirce", title: "On the Algebra of Logic", date: "1885", publisher: "American Journal of Mathematics", note: "Extended Boolean algebra. Invented truth tables. Foundational for computing.", link: "https://archive.org/details/jstor-2369442" },
      { author: "Condorcet", title: "Esquisse d'un tableau historique", date: "1795", publisher: "Paris: Agasse (posthumous)", note: "Progress through reason. Probability applied to social science. Early data science thinking.", link: "https://archive.org/details/esquissehistoriq00cond" },
      { author: "Jacquard", title: "[Punched Card System]", date: "1804", publisher: "Lyon: [patents]", note: "Punched cards controlling looms. Babbage adopted for Analytical Engine. First 'programming'." },
      { author: "Locke", title: "An Essay Concerning Human Understanding", date: "1689", publisher: "London: Thomas Bassett", note: "TABULA RASA - mind as blank slate. Ideas from sensation. Foundation of empiricist psychology.", link: "https://archive.org/details/essayconcerningh0000lock_d0p1" },
      { author: "Hume", title: "A Treatise of Human Nature", date: "1739", publisher: "London: John Noon", note: "Bundle theory of self - no continuous 'I'. Radical skepticism about personal identity.", link: "https://archive.org/details/treatiseofhumann0001hume" },
      { author: "Berkeley", title: "A Treatise Concerning the Principles of Human Knowledge", date: "1710", publisher: "Dublin: Aaron Rhames", note: "Esse est percipi - to be is to be perceived. Idealism about mind and world.", link: "https://archive.org/details/isbn_9781490323985" },
      { author: "Spinoza", title: "Ethica ordine geometrico demonstrata", date: "1677", publisher: "Amsterdam: Jan Rieuwertsz (posthumous)", note: "Mind and body as ONE substance. Parallelism. Emotions as confused ideas.", link: "https://archive.org/details/benedictidespin00girgoog" },
      { author: "Descartes", title: "Les Passions de l'Âme", date: "1649", publisher: "Paris: Henry Le Gras", note: "Mind-body interaction via pineal gland. Classification of emotions. Dualism's last defense.", link: "https://archive.org/details/descartes_passions_201506" },
      { author: "Melanchthon", title: "Liber de anima", date: "1540", publisher: "Wittenberg: Joseph Klug", note: "Protestant psychology. Soul's faculties. Most-used textbook on mind in 16th century.", link: "https://archive.org/details/hin-wel-all-00002382-001" },
      { author: "Wolff", title: "Psychologia empirica", date: "1732", publisher: "Frankfurt: Renger", note: "COINED 'psychology' as a science. Empirical vs rational psychology distinction.", link: "https://archive.org/details/psychologiaempi00vongoog" },
      { author: "Condillac", title: "Traité des sensations", date: "1754", publisher: "Paris: De Bure", note: "The STATUE thought experiment - consciousness built from pure sensation. Radical sensationalism.", link: "https://archive.org/details/traitedessensati0000cond" },
      { author: "Hartley", title: "Observations on Man", date: "1749", publisher: "London: Samuel Richardson", note: "ASSOCIATIONISM - all mental life from association of ideas. Vibrations in nerves. Proto-neuroscience.", link: "https://archive.org/details/observationsonm00pistgoog" },
      { author: "Wundt", title: "Grundzüge der physiologischen Psychologie", date: "1874", publisher: "Leipzig: Wilhelm Engelmann", note: "Founded EXPERIMENTAL PSYCHOLOGY. First psychology laboratory (1879). Scientific study of consciousness.", link: "https://archive.org/details/grundzgederphys06wundgoog" },
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
