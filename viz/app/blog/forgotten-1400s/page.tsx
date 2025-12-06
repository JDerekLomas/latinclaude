import BlogLayout from "../BlogLayout";

export default function Forgotten1400s() {
  return (
    <BlogLayout
      title="The Forgotten Quattrocento: Thinkers of the 1400s You Can't Read"
      tag="Research"
      prevPost={{ href: "/blog/forgotten-authors", title: "The Forgotten Giants" }}
      nextPost={{ href: "/blog/forgotten-1500s", title: "Forgotten Authors of the 1500s" }}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        The fifteenth century gave us the Renaissance. It also gave us hundreds of Latin
        thinkers whose works shaped European thought—and remain untranslated.
      </p>

      <h2>The Century That Changed Everything</h2>

      <p>
        The 1400s saw the fall of Constantinople (1453), the invention of printing (c. 1450),
        and the rediscovery of ancient texts that sparked the Renaissance. Italian humanists
        recovered Lucretius, debated Plato versus Aristotle, and invented new ways of thinking
        about nature, politics, and the human condition.
      </p>

      <p>
        We know the famous names: Ficino, Pico della Mirandola, Leonardo Bruni. But even these
        canonical figures are only partially translated. And beneath them lies a vast network
        of scholars, physicians, and natural philosophers whose Latin works have never been
        rendered into English.
      </p>

      <h2>The Untranslated Quattrocento</h2>

      <p>Here are 15 important 15th-century thinkers whose work remains largely inaccessible:</p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        overflow: 'hidden',
      }}>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0d8c8' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Author</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Dates</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Field</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Giovanni Pontano", "1426-1503", "Humanism, poetry, political philosophy"],
              ["Giorgio Valla", "1447-1500", "Mathematics, medicine, encyclopedism"],
              ["Niccolò Leoniceno", "1428-1524", "Medicine, botanical criticism"],
              ["Antonio Ferrariis (Galateo)", "1444-1517", "Natural philosophy, geography"],
              ["Giovanni Marliani", "c.1420-1483", "Physics, mathematics, medicine"],
              ["Paul of Venice", "c.1369-1429", "Logic, natural philosophy"],
              ["Gaetano da Thiene", "1387-1465", "Logic, philosophy of science"],
              ["Nicoletto Vernia", "c.1420-1499", "Aristotelian philosophy"],
              ["Giovanni Pico's circle", "fl. 1480s", "Kabbalah, syncretism"],
              ["Ermolao Barbaro", "1454-1493", "Aristotelian natural philosophy"],
              ["Jacopo Zabarella's teachers", "fl. 1450s", "Paduan Aristotelianism"],
              ["Antonio Benivieni", "1443-1502", "Anatomy, pathology"],
              ["Filippo Beroaldo", "1453-1505", "Classical philology, commentary"],
              ["Giovanni Battista Pio", "c.1460-1540", "Commentary, encyclopedic learning"],
              ["Poliziano (partial)", "1454-1494", "Philology, textual criticism"],
            ].map(([author, dates, field], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{author}</td>
                <td style={{ padding: '12px 8px', color: '#666', fontFamily: 'monospace', fontSize: '13px' }}>{dates}</td>
                <td style={{ padding: '12px 8px', color: '#666' }}>{field}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>Key Figures in Detail</h2>

      <h3 style={{ color: '#9e4a3a' }}>Giorgio Valla (1447-1500)</h3>
      <p>
        Valla&apos;s <em>De expetendis et fugiendis rebus</em> (1501) was a massive encyclopedia
        of ancient learning—49 books covering arithmetic, music, geometry, astronomy, physics,
        medicine, and moral philosophy. It transmitted Greek scientific knowledge to Renaissance
        readers and influenced everyone from Copernicus to the architects of St. Peter&apos;s.
        No complete English translation exists.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Giovanni Pontano (1426-1503)</h3>
      <p>
        The greatest Latin poet of the Renaissance and a major political thinker. His dialogues
        on fortune, prudence, and civil life (<em>De fortuna</em>, <em>De prudentia</em>,
        <em>Aegidius</em>) shaped humanist ethics. His astronomical poem <em>Urania</em>
        combined scientific observation with classical form. A few poems are translated;
        his philosophical dialogues remain in Latin.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Paul of Venice (c.1369-1429)</h3>
      <p>
        One of the most important logicians of the late medieval period. His <em>Logica Magna</em>
        was a comprehensive treatment of logic that influenced philosophical education for over
        a century. His work on the logic of scientific reasoning anticipates later developments.
        Only fragments have been translated.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Niccolò Leoniceno (1428-1524)</h3>
      <p>
        The physician who challenged Pliny. His <em>De Plinii erroribus</em> (1492) was a
        revolutionary work of botanical and medical criticism, using Greek sources to correct
        errors in the Latin tradition. It launched the movement for empirical observation over
        textual authority in medicine. No English translation.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Ermolao Barbaro (1454-1493)</h3>
      <p>
        His translations and commentaries on Aristotle&apos;s natural philosophy transformed how
        the Renaissance understood ancient science. His <em>Castigationes Plinianae</em>
        corrected thousands of errors in Pliny&apos;s Natural History. Called &ldquo;the most learned
        man in Italy&rdquo; by his contemporaries. Almost nothing in English.
      </p>

      <h2>The Paduan School</h2>

      <p>
        The University of Padua was the center of natural philosophy in the 1400s. Here,
        scholars developed sophisticated approaches to scientific method, debated the nature
        of the soul, and pioneered anatomical research. Names like Gaetano da Thiene,
        Nicoletto Vernia, and their students form a crucial link between medieval and
        early modern science.
      </p>

      <p>
        Yet the Paduan school is known mainly through secondary literature. The actual texts—
        commentaries on Aristotle, treatises on method, disputations on the soul—remain
        available only in Latin (and often only in early printed editions or manuscripts).
      </p>

      <h2>What We&apos;re Missing</h2>

      <p>
        The untranslated works of the Quattrocento contain:
      </p>

      <ul>
        <li><strong>Scientific method</strong> — How Renaissance thinkers understood
        demonstration, observation, and proof</li>
        <li><strong>Medical revolution</strong> — The critique of ancient authorities
        that made modern medicine possible</li>
        <li><strong>Textual criticism</strong> — The birth of philology and its
        implications for knowledge</li>
        <li><strong>Political humanism</strong> — Ideas about civic life, virtue,
        and governance beyond Machiavelli</li>
        <li><strong>Encyclopedia tradition</strong> — How knowledge was organized
        and transmitted</li>
      </ul>

      <p>
        When we teach &ldquo;Renaissance philosophy,&rdquo; we typically mean a handful of translated
        works by Ficino, Pico, and Machiavelli. But they were part of a much larger conversation.
        Without access to that conversation, we understand the Renaissance through a narrow window.
      </p>

      <h2>The Path Forward</h2>

      <p>
        Many of these texts are now digitized. The <a href="https://ustc.ac.uk" style={{ color: '#9e4a3a' }}>USTC</a> catalogs
        them; libraries like the Bayerische Staatsbibliothek and the Internet Archive have scanned them.
        What&apos;s missing is the translation—the bridge between early printed Latin and modern readers.
      </p>

      <p>
        AI-assisted translation could change this. Not to replace scholarly editions, but to provide
        working translations that make these texts accessible for the first time. A researcher could
        read Valla&apos;s encyclopedia or Pontano&apos;s dialogues without years of Latin training.
      </p>

      <p>
        The Quattrocento is waiting to be rediscovered.
      </p>
    </BlogLayout>
  );
}
