"use client";

import { useState } from "react";

interface Person {
  name: string;
  birth: number;
  death: number;
  description: string;
  works: string;
  image?: string;
  wikipedia?: string;
}

interface Category {
  name: string;
  color: string;
  people: Person[];
}

const data: Category[] = [
  {
    name: "Patrons & Politics",
    color: "#d4a574",
    people: [
      { name: "Gemistus Plethon", birth: 1355, death: 1452, description: "Byzantine philosopher who revived Plato in Italy", works: "Book of Laws", wikipedia: "https://en.wikipedia.org/wiki/Gemistus_Pletho", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sanzio_01_Parmenides.jpg/220px-Sanzio_01_Parmenides.jpg" },
      { name: "Pope Nicholas V", birth: 1397, death: 1455, description: "Founded Vatican Library, patron of translators", works: "Papal Bulls", wikipedia: "https://en.wikipedia.org/wiki/Pope_Nicholas_V", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pope_Nicholas_V.PNG/220px-Pope_Nicholas_V.PNG" },
      { name: "Cosimo de' Medici", birth: 1389, death: 1464, description: "Founded Medici dynasty, patron of arts", works: "Platonic Academy patron", wikipedia: "https://en.wikipedia.org/wiki/Cosimo_de%27_Medici", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cosimo_di_Medici_%28Bronzino%29.jpg/220px-Cosimo_di_Medici_%28Bronzino%29.jpg" },
      { name: "Lorenzo de' Medici", birth: 1449, death: 1492, description: "Il Magnifico; patron of Michelangelo, Botticelli", works: "Poesie", wikipedia: "https://en.wikipedia.org/wiki/Lorenzo_de%27_Medici", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Giorgio_vasari%2C_ritratto_di_lorenzo_il_magnifico.jpg/220px-Giorgio_vasari%2C_ritratto_di_lorenzo_il_magnifico.jpg" },
      { name: "Savonarola", birth: 1452, death: 1498, description: "Dominican friar who ruled Florence; burned books", works: "Sermons", wikipedia: "https://en.wikipedia.org/wiki/Girolamo_Savonarola", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Girolamo_Savonarola.jpg/220px-Girolamo_Savonarola.jpg" },
      { name: "Federico da Montefeltro", birth: 1422, death: 1482, description: "Duke of Urbino, humanist condottiero", works: "Library of Urbino", wikipedia: "https://en.wikipedia.org/wiki/Federico_da_Montefeltro", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Piero_della_Francesca_044.jpg/220px-Piero_della_Francesca_044.jpg" },
      { name: "Pope Leo X", birth: 1475, death: 1521, description: "Medici pope; patron of Raphael, sold indulgences", works: "Exsurge Domine", wikipedia: "https://en.wikipedia.org/wiki/Pope_Leo_X", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pope_Leo_X.jpg/220px-Pope_Leo_X.jpg" },
      { name: "Rudolf II", birth: 1552, death: 1612, description: "Holy Roman Emperor; patron of alchemy & art", works: "Kunstkammer collection", wikipedia: "https://en.wikipedia.org/wiki/Rudolf_II,_Holy_Roman_Emperor", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Joseph_Heintz_d._%C3%84._002.jpg/220px-Joseph_Heintz_d._%C3%84._002.jpg" },
      { name: "James I", birth: 1566, death: 1625, description: "King; sponsored KJV Bible, wrote on witchcraft", works: "Daemonologie", wikipedia: "https://en.wikipedia.org/wiki/James_VI_and_I", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/JamesIEngland.jpg/220px-JamesIEngland.jpg" },
    ]
  },
  {
    name: "Humanism",
    color: "#9e4a3a",
    people: [
      { name: "Petrarch", birth: 1304, death: 1374, description: "Father of Humanism", works: "Africa, Secretum", wikipedia: "https://en.wikipedia.org/wiki/Petrarch", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Petrarch_by_Bargilla.jpg/220px-Petrarch_by_Bargilla.jpg" },
      { name: "Giovanni Boccaccio", birth: 1313, death: 1375, description: "Author of Decameron, friend of Petrarch", works: "Decameron, Genealogia deorum", wikipedia: "https://en.wikipedia.org/wiki/Giovanni_Boccaccio", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Andrea_del_Castagno_Giovanni_Boccaccio_c_1450.jpg/220px-Andrea_del_Castagno_Giovanni_Boccaccio_c_1450.jpg" },
      { name: "Coluccio Salutati", birth: 1331, death: 1406, description: "Florentine chancellor, civic humanist", works: "De laboribus Herculis", wikipedia: "https://en.wikipedia.org/wiki/Coluccio_Salutati", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Coluccio_Salutati.png/220px-Coluccio_Salutati.png" },
      { name: "Leon Battista Alberti", birth: 1404, death: 1472, description: "Architect, author; Renaissance man", works: "De re aedificatoria", wikipedia: "https://en.wikipedia.org/wiki/Leon_Battista_Alberti", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Leonis_Baptistae_Alberti.jpg/220px-Leonis_Baptistae_Alberti.jpg" },
      { name: "Marsilio Ficino", birth: 1433, death: 1499, description: "Translated Plato & Hermetica", works: "Theologia Platonica", wikipedia: "https://en.wikipedia.org/wiki/Marsilio_Ficino", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Marsilio_Ficino_-_Chiesa_fiorentina_di_S._Maria_del_Fiore.jpg/220px-Marsilio_Ficino_-_Chiesa_fiorentina_di_S._Maria_del_Fiore.jpg" },
      { name: "Angelo Poliziano", birth: 1454, death: 1494, description: "Greatest Latin poet of the Renaissance", works: "Sylvae, Miscellanea", wikipedia: "https://en.wikipedia.org/wiki/Poliziano", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Angelo_Poliziano_-_Imagines_philologorum.jpg/220px-Angelo_Poliziano_-_Imagines_philologorum.jpg" },
      { name: "Pico della Mirandola", birth: 1463, death: 1494, description: "Oration on Dignity of Man", works: "900 Theses", wikipedia: "https://en.wikipedia.org/wiki/Giovanni_Pico_della_Mirandola", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pico_della_Mirandola.jpg/220px-Pico_della_Mirandola.jpg" },
      { name: "Erasmus", birth: 1466, death: 1536, description: "Prince of Humanists", works: "In Praise of Folly", wikipedia: "https://en.wikipedia.org/wiki/Erasmus", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Holbein-erasmus.jpg/220px-Holbein-erasmus.jpg" },
      { name: "Thomas More", birth: 1478, death: 1535, description: "Invented Utopia", works: "Utopia", wikipedia: "https://en.wikipedia.org/wiki/Thomas_More", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Hans_Holbein%2C_the_Younger_-_Sir_Thomas_More_-_Google_Art_Project.jpg/220px-Hans_Holbein%2C_the_Younger_-_Sir_Thomas_More_-_Google_Art_Project.jpg" },
      { name: "Juan Luis Vives", birth: 1493, death: 1540, description: "Spanish humanist, educator", works: "De anima et vita", wikipedia: "https://en.wikipedia.org/wiki/Juan_Luis_Vives", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Joan_Llu%C3%ADs_Vives.jpg/220px-Joan_Llu%C3%ADs_Vives.jpg" },
      { name: "Aldus Manutius", birth: 1449, death: 1515, description: "Venetian printer; invented italic type, pocket books", works: "Aldine Press editions", wikipedia: "https://en.wikipedia.org/wiki/Aldus_Manutius", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Aldus_Manutius.jpg/220px-Aldus_Manutius.jpg" },
    ]
  },
  {
    name: "Reformation",
    color: "#c9a86c",
    people: [
      { name: "Jan Hus", birth: 1372, death: 1415, description: "Czech reformer, burned at stake", works: "De Ecclesia", wikipedia: "https://en.wikipedia.org/wiki/Jan_Hus", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Jan_Hus_at_the_Stake.jpg/220px-Jan_Hus_at_the_Stake.jpg" },
      { name: "Martin Luther", birth: 1483, death: 1546, description: "Sparked Protestant Reformation", works: "95 Theses", wikipedia: "https://en.wikipedia.org/wiki/Martin_Luther", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg/220px-Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg" },
      { name: "Ulrich Zwingli", birth: 1484, death: 1531, description: "Swiss reformer", works: "67 Articles", wikipedia: "https://en.wikipedia.org/wiki/Huldrych_Zwingli", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ulrich_Zwingli.jpg/220px-Ulrich_Zwingli.jpg" },
      { name: "Melanchthon", birth: 1497, death: 1560, description: "Teacher of Germany", works: "Loci Communes", wikipedia: "https://en.wikipedia.org/wiki/Philip_Melanchthon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Lucas_Cranach_d.%C3%84._-_Bildnis_Philipp_Melanchthon_%281543%2C_Uffizien%29.jpg/220px-Lucas_Cranach_d.%C3%84._-_Bildnis_Philipp_Melanchthon_%281543%2C_Uffizien%29.jpg" },
      { name: "John Calvin", birth: 1509, death: 1564, description: "Reformed theology", works: "Institutes", wikipedia: "https://en.wikipedia.org/wiki/John_Calvin", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/John_Calvin_-_Young.jpg/220px-John_Calvin_-_Young.jpg" },
    ]
  },
  {
    name: "Occult Philosophy",
    color: "#8b5cf6",
    people: [
      { name: "Johannes Trithemius", birth: 1462, death: 1516, description: "Cryptographer, historian of magic", works: "Steganographia", wikipedia: "https://en.wikipedia.org/wiki/Johannes_Trithemius", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Trithemius.jpg/220px-Trithemius.jpg" },
      { name: "Cornelius Agrippa", birth: 1486, death: 1535, description: "Systematized Renaissance magic", works: "De occulta philosophia", wikipedia: "https://en.wikipedia.org/wiki/Heinrich_Cornelius_Agrippa", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Agrippa.png/220px-Agrippa.png" },
      { name: "John Dee", birth: 1527, death: 1608, description: "Mathematician & astrologer to Elizabeth I", works: "Monas Hieroglyphica", wikipedia: "https://en.wikipedia.org/wiki/John_Dee", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/John_Dee_Ashmolean.jpg/220px-John_Dee_Ashmolean.jpg" },
      { name: "Giambattista della Porta", birth: 1535, death: 1615, description: "Natural magic & optics pioneer", works: "Magia Naturalis", wikipedia: "https://en.wikipedia.org/wiki/Giambattista_della_Porta", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Giambattista_della_Porta.jpeg/220px-Giambattista_della_Porta.jpeg" },
      { name: "Robert Fludd", birth: 1574, death: 1637, description: "Rosicrucian cosmologist", works: "Utriusque Cosmi Historia", wikipedia: "https://en.wikipedia.org/wiki/Robert_Fludd", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Vitruvian_macrocosm.jpg/220px-Vitruvian_macrocosm.jpg" },
      { name: "Heinrich Khunrath", birth: 1560, death: 1605, description: "Hermetic philosopher, alchemist", works: "Amphitheatrum Sapientiae Aeternae", wikipedia: "https://en.wikipedia.org/wiki/Heinrich_Khunrath", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Amphitheatrum_sapientiae_aeternae_-_Alchemist%27s_Laboratory.jpg/220px-Amphitheatrum_sapientiae_aeternae_-_Alchemist%27s_Laboratory.jpg" },
      { name: "Michael Maier", birth: 1568, death: 1622, description: "Alchemist at Rudolf II's court", works: "Atalanta Fugiens", wikipedia: "https://en.wikipedia.org/wiki/Michael_Maier", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Michael_Maier_Atalanta_Fugiens_Emblem_21.jpeg/220px-Michael_Maier_Atalanta_Fugiens_Emblem_21.jpeg" },
      { name: "Cornelis Drebbel", birth: 1572, death: 1633, description: "Inventor, alchemist; built first submarine", works: "Submarine, perpetual motion", wikipedia: "https://en.wikipedia.org/wiki/Cornelis_Drebbel", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Drebbel-Van_Sichem-1631.jpg/220px-Drebbel-Van_Sichem-1631.jpg" },
    ]
  },
  {
    name: "Philosophy",
    color: "#546b8a",
    people: [
      { name: "Nicholas of Cusa", birth: 1401, death: 1464, description: "Proposed Earth moves, no center", works: "De docta ignorantia", wikipedia: "https://en.wikipedia.org/wiki/Nicholas_of_Cusa", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Nicholas_of_Cusa.jpg/220px-Nicholas_of_Cusa.jpg" },
      { name: "Michel de Montaigne", birth: 1533, death: 1592, description: "Inventor of the essay; radical skeptic", works: "Essais", wikipedia: "https://en.wikipedia.org/wiki/Michel_de_Montaigne", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Portrait_of_Michel_de_Montaigne%2C_circa_unknown.jpg/220px-Portrait_of_Michel_de_Montaigne%2C_circa_unknown.jpg" },
      { name: "Giordano Bruno", birth: 1548, death: 1600, description: "Infinite worlds; burned for heresy", works: "De l'infinito", wikipedia: "https://en.wikipedia.org/wiki/Giordano_Bruno", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Giordano_Bruno_Campo_dei_Fiori.jpg/220px-Giordano_Bruno_Campo_dei_Fiori.jpg" },
      { name: "Tommaso Campanella", birth: 1568, death: 1639, description: "Utopian philosopher, imprisoned 27 years", works: "City of the Sun", wikipedia: "https://en.wikipedia.org/wiki/Tommaso_Campanella", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Tommaso_Campanella.jpg/220px-Tommaso_Campanella.jpg" },
      { name: "Descartes", birth: 1596, death: 1650, description: "I think therefore I am", works: "Meditationes", wikipedia: "https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/220px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg" },
      { name: "Spinoza", birth: 1632, death: 1677, description: "God = Nature", works: "Ethica", wikipedia: "https://en.wikipedia.org/wiki/Baruch_Spinoza", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Spinoza.jpg/220px-Spinoza.jpg" },
      { name: "Leibniz", birth: 1646, death: 1716, description: "Invented calculus, monads", works: "Monadology", wikipedia: "https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Gottfried_Wilhelm_von_Leibniz.jpg/220px-Gottfried_Wilhelm_von_Leibniz.jpg" },
    ]
  },
  {
    name: "Science",
    color: "#8b9a7d",
    people: [
      { name: "Copernicus", birth: 1473, death: 1543, description: "Sun-centered universe", works: "De revolutionibus", wikipedia: "https://en.wikipedia.org/wiki/Nicolaus_Copernicus", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nikolaus_Kopernikus.jpg/220px-Nikolaus_Kopernikus.jpg" },
      { name: "Paracelsus", birth: 1493, death: 1541, description: "Revolutionary physician", works: "Paragranum", wikipedia: "https://en.wikipedia.org/wiki/Paracelsus", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Paracelsus.jpg/220px-Paracelsus.jpg" },
      { name: "Vesalius", birth: 1514, death: 1564, description: "Father of modern anatomy", works: "De humani corporis fabrica", wikipedia: "https://en.wikipedia.org/wiki/Andreas_Vesalius", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Vesalius_Fabrica_p184.jpg/220px-Vesalius_Fabrica_p184.jpg" },
      { name: "Tycho Brahe", birth: 1546, death: 1601, description: "Greatest pre-telescope astronomer", works: "Astronomiae instauratae mechanica", wikipedia: "https://en.wikipedia.org/wiki/Tycho_Brahe", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Tycho_Brahe.JPG/220px-Tycho_Brahe.JPG" },
      { name: "Francis Bacon", birth: 1561, death: 1626, description: "Scientific method", works: "Novum Organum", wikipedia: "https://en.wikipedia.org/wiki/Francis_Bacon", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%282%29.jpg/220px-Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%282%29.jpg" },
      { name: "Galileo", birth: 1564, death: 1642, description: "Telescope reveals Jupiter's moons", works: "Sidereus Nuncius", wikipedia: "https://en.wikipedia.org/wiki/Galileo_Galilei", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/220px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg" },
      { name: "Kepler", birth: 1571, death: 1630, description: "Laws of planetary motion", works: "Astronomia Nova", wikipedia: "https://en.wikipedia.org/wiki/Johannes_Kepler", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Johannes_Kepler_1610.jpg/220px-Johannes_Kepler_1610.jpg" },
      { name: "William Harvey", birth: 1578, death: 1657, description: "Discovered blood circulation", works: "De motu cordis", wikipedia: "https://en.wikipedia.org/wiki/William_Harvey", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/William_Harvey_2.jpg/220px-William_Harvey_2.jpg" },
      { name: "Isaac Beeckman", birth: 1588, death: 1637, description: "Dutch scientist; mentor to Descartes", works: "Journal", wikipedia: "https://en.wikipedia.org/wiki/Isaac_Beeckman", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Isaac_Beeckman.jpg/220px-Isaac_Beeckman.jpg" },
      { name: "Athanasius Kircher", birth: 1602, death: 1680, description: "Last man who knew everything", works: "Oedipus Aegyptiacus", wikipedia: "https://en.wikipedia.org/wiki/Athanasius_Kircher", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Athanasius_Kircher_%28cropped%29.jpg/220px-Athanasius_Kircher_%28cropped%29.jpg" },
      { name: "Robert Boyle", birth: 1627, death: 1691, description: "Father of modern chemistry", works: "The Sceptical Chymist", wikipedia: "https://en.wikipedia.org/wiki/Robert_Boyle", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/The_Shannon_Portrait_of_the_Hon._Robert_Boyle.jpg/220px-The_Shannon_Portrait_of_the_Hon._Robert_Boyle.jpg" },
      { name: "Newton", birth: 1643, death: 1727, description: "Gravity, calculus, optics", works: "Principia Mathematica", wikipedia: "https://en.wikipedia.org/wiki/Isaac_Newton", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/220px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg" },
    ]
  },
];

const START_YEAR = 1300;
const END_YEAR = 1750;
const YEAR_RANGE = END_YEAR - START_YEAR;

export default function LifespanTimeline() {
  const [selected, setSelected] = useState<{ category: string; person: Person } | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const yearToPercent = (year: number) => ((year - START_YEAR) / YEAR_RANGE) * 100;

  // Generate tick marks for centuries
  const centuries = [1300, 1400, 1500, 1600, 1700];

  return (
    <div style={{ background: '#fdfcf9', padding: '24px 0' }}>
      {/* Year axis */}
      <div style={{
        position: 'relative',
        height: '40px',
        marginBottom: '8px',
        marginLeft: '140px',
        marginRight: '24px',
      }}>
        {centuries.map(year => (
          <div
            key={year}
            style={{
              position: 'absolute',
              left: `${yearToPercent(year)}%`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#666',
            }}>
              {year}
            </div>
            <div style={{
              width: '1px',
              height: '8px',
              background: '#ccc',
              margin: '4px auto 0',
            }} />
          </div>
        ))}
        {/* Hover year indicator */}
        {hoveredYear && (
          <div
            style={{
              position: 'absolute',
              left: `${yearToPercent(hoveredYear)}%`,
              top: '0',
              transform: 'translateX(-50%)',
              background: '#1a1612',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {hoveredYear}
          </div>
        )}
      </div>

      {/* Categories and bars */}
      {data.map((category) => (
        <div key={category.name} style={{ marginBottom: '24px' }}>
          {/* Category label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            paddingLeft: '12px',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: category.color,
              marginRight: '8px',
            }} />
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1612',
            }}>
              {category.name}
            </span>
          </div>

          {/* People bars */}
          <div style={{ position: 'relative' }}>
            {category.people.map((person) => {
              const left = yearToPercent(person.birth);
              const width = yearToPercent(person.death) - left;
              const isSelected = selected?.person.name === person.name;

              return (
                <div
                  key={person.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                    marginBottom: '4px',
                  }}
                >
                  {/* Name label */}
                  <div style={{
                    width: '140px',
                    paddingRight: '12px',
                    textAlign: 'right',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: isSelected ? category.color : '#555',
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {person.name}
                  </div>

                  {/* Timeline area */}
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      height: '100%',
                      marginRight: '24px',
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percent = x / rect.width;
                      const year = Math.round(START_YEAR + percent * YEAR_RANGE);
                      setHoveredYear(year);
                    }}
                    onMouseLeave={() => setHoveredYear(null)}
                  >
                    {/* Grid lines for centuries */}
                    {centuries.map(year => (
                      <div
                        key={year}
                        style={{
                          position: 'absolute',
                          left: `${yearToPercent(year)}%`,
                          top: 0,
                          bottom: 0,
                          width: '1px',
                          background: '#e8e4dc',
                        }}
                      />
                    ))}

                    {/* Lifespan bar */}
                    <div
                      onClick={() => setSelected(isSelected ? null : { category: category.name, person })}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        width: `${width}%`,
                        top: '4px',
                        height: '24px',
                        background: isSelected ? category.color : `${category.color}cc`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? `0 2px 8px ${category.color}66` : 'none',
                        border: isSelected ? '2px solid #1a1612' : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'scaleY(1.15)';
                          e.currentTarget.style.background = category.color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'scaleY(1)';
                          e.currentTarget.style.background = `${category.color}cc`;
                        }
                      }}
                    >
                      {/* Birth/death labels on bar */}
                      <span style={{
                        position: 'absolute',
                        left: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '10px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#fff',
                        fontWeight: 500,
                        opacity: width > 8 ? 1 : 0,
                      }}>
                        {person.birth}
                      </span>
                      <span style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '10px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#fff',
                        fontWeight: 500,
                        opacity: width > 8 ? 1 : 0,
                      }}>
                        {person.death}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected person detail panel */}
      {selected && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '20px 24px',
          maxWidth: '500px',
          width: 'calc(100% - 48px)',
          zIndex: 100,
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          border: `3px solid ${data.find(c => c.name === selected.category)?.color}`,
        }}>
          {selected.person.image && (
            <img
              src={selected.person.image}
              alt={selected.person.name}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '8px',
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#1a1612',
                  margin: 0,
                }}>
                  {selected.person.name}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: '#888',
                  margin: '4px 0 0 0',
                }}>
                  {selected.person.birth}–{selected.person.death} ({selected.person.death - selected.person.birth} years)
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#888',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <p style={{
              fontFamily: 'Newsreader, serif',
              fontSize: '15px',
              color: '#444',
              margin: '12px 0 8px 0',
            }}>
              {selected.person.description}
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#666',
              margin: 0,
            }}>
              <strong>Key work:</strong> <em>{selected.person.works}</em>
            </p>
            {selected.person.wikipedia && (
              <a
                href={selected.person.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '6px 12px',
                  background: '#f5f0e8',
                  color: '#9e4a3a',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Wikipedia →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
