import BlogLayout from "../BlogLayout";

export default function PythagorasSankhya() {
  return (
    <BlogLayout
      title="The Golden Verses of Pythagoras: A 19th-Century Manuscript Mystery"
      tag="Research"
      slug="pythagoras-sankhya"
      prevPost={{ href: "/blog/sanskrit-manuscripts", title: "Sanskrit Manuscripts" }}
      nextPost={{ href: "/blog/methodology", title: "Methodology" }}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        A palm-leaf manuscript in the Royal Asiatic Society bears a curious English label:
        &ldquo;SĀṄKHYA-SAPTATI or golden verses of Pythagoras.&rdquo; This label preserves a
        fascinating moment in intellectual history&mdash;when British scholars believed they had
        found the &ldquo;Indian Pythagoras.&rdquo;
      </p>

      <h2>The Manuscript: Whish No. 147</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderCollapse: 'collapse',
        }}>
          <tbody>
            {[
              ["Collection", "Whish Collection, Royal Asiatic Society"],
              ["Collector", "Charles Matthew Whish (1794–1833)"],
              ["Location Collected", "Kerala, South India"],
              ["Date of Copy", "Early 19th century"],
              ["Script", "Malayalam"],
              ["Material", "Palm-leaf with wooden cover boards"],
              ["Contents", "Sāṃkhyakārikā (complete) + Tarkasaṃgraha (partial)"],
            ].map(([label, value], i) => (
              <tr key={i} style={{ borderBottom: i < 6 ? '1px solid #e0d8c8' : 'none' }}>
                <td style={{ padding: '12px 8px', color: '#666', width: '40%' }}>{label}</td>
                <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      {/* Manuscript Images */}
      <figure style={{
        margin: '32px 0',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {[
            { src: '/manuscripts/sankhya_f1.jpg', label: 'Folio 1: Opening invocation' },
            { src: '/manuscripts/sankhya_f2.jpg', label: 'Folio 2: Verses 5-10' },
            { src: '/manuscripts/sankhya_f7.jpg', label: 'Folio 7: Final verses' },
          ].map((img, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <img
                src={img.src}
                alt={img.label}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #e0d8c8',
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '8px',
                fontFamily: 'Inter, sans-serif',
              }}>{img.label}</p>
            </div>
          ))}
        </div>
        <figcaption style={{
          fontSize: '14px',
          color: '#666',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          Whish No. 147: The Sāṃkhyakārikā in Malayalam script on palm leaf
          (<a href="https://archive.org/details/raswhish145-147" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Internet Archive</a>)
        </figcaption>
      </figure>

      <p>
        Charles Whish was a British civil servant in the Madras Presidency who collected Sanskrit
        manuscripts from Kerala. He is best known for discovering that Indian mathematicians had
        developed infinite series for trigonometric functions centuries before Newton and Leibniz.
        His manuscript collection, now at the Royal Asiatic Society, contains hundreds of palm-leaf
        texts from Kerala&apos;s scholarly traditions.
      </p>

      <h2>The &ldquo;Pythagoras&rdquo; Connection</h2>

      <p>
        The English label on the manuscript&apos;s wooden cover is striking:
      </p>

      <figure style={{
        background: '#1a1612',
        color: '#f5f0e8',
        padding: '24px 32px',
        borderRadius: '8px',
        margin: '32px 0',
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '20px',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        &ldquo;SĀṄKHYA-SAPTATI or golden verses of Pythagoras&rdquo;
      </figure>

      <p>
        This reflects a specific 18th/19th-century Orientalist theory. Early British scholars like
        Sir William Jones noticed striking parallels between Indian <strong>Sāṃkhya</strong> philosophy
        and the Greek <strong>Pythagorean</strong> tradition:
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0d8c8' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Doctrine</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Sāṃkhya (India)</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Pythagoras (Greece)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Dualism", "Puruṣa (Spirit) vs Prakṛti (Matter)", "Monad vs Dyad"],
              ["Numerology", "\"Sāṃkhya\" = Enumeration (25 principles)", "\"All is Number\""],
              ["Transmigration", "Rebirth based on karma", "Metempsychosis"],
              ["Liberation", "Kaivalya (Isolation of Spirit)", "Purification of Soul"],
              ["Golden Verses", "Sāṃkhyakārikā (72 verses)", "Golden Verses of Pythagoras"],
            ].map(([doctrine, sankhya, pythagoras], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#9e4a3a', fontWeight: 500 }}>{doctrine}</td>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{sankhya}</td>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{pythagoras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <p>
        The <em>Golden Verses of Pythagoras</em> was a famous Greek compendium of moral maxims
        attributed to Pythagoras. For Whish and his contemporaries, the <em>Sāṃkhyakārikā</em>
        (72 verses) seemed like its Indian counterpart&mdash;a systematic enumeration of cosmic
        principles that taught liberation through knowledge.
      </p>

      <h2>What is the Sāṃkhyakārikā?</h2>

      <p>
        The <strong>Sāṃkhyakārikā</strong> (&ldquo;Verses on Enumeration&rdquo;) is the foundational
        text of the Sāṃkhya school of Indian philosophy, composed by <strong>Īśvarakṛṣṇa</strong>
        around the 4th century CE. It systematically enumerates 25 cosmic principles (<em>tattvas</em>)
        and explains how liberation is achieved through discriminative knowledge.
      </p>

      <h3>The 25 Principles</h3>

      <figure style={{
        background: '#fff',
        border: '2px solid #9e4a3a',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>1. Puruṣa</strong> (Spirit/Witness) &mdash; Eternal, conscious, inactive
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>2. Prakṛti</strong> (Primordial Nature) &mdash; Uncaused cause, three <em>guṇas</em>
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>3. Mahat/Buddhi</strong> (Intellect) &mdash; First evolute, determines
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>4. Ahaṃkāra</strong> (Ego) &mdash; The &ldquo;I-maker&rdquo;
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>5. Manas</strong> (Mind) &mdash; Deliberates, synthesizes
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>6–10. Five Sense Organs</strong> &mdash; Hearing, touch, sight, taste, smell
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>11–15. Five Action Organs</strong> &mdash; Speech, grasping, walking, excretion, reproduction
          </p>
          <p style={{ margin: '0 0 16px 0' }}>
            <strong style={{ color: '#9e4a3a' }}>16–20. Five Subtle Elements</strong> &mdash; Sound, touch, form, taste, smell (tanmātras)
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#9e4a3a' }}>21–25. Five Gross Elements</strong> &mdash; Space, air, fire, water, earth
          </p>
        </div>
      </figure>

      <h3>Key Doctrines</h3>

      <p><strong>Satkāryavāda (Effect Pre-exists in Cause)</strong></p>
      <p style={{ marginLeft: '24px', fontStyle: 'italic', color: '#666' }}>
        &ldquo;Nothing can come from nothing; a specific cause produces a specific effect.&rdquo;
        (Verse 9)
      </p>

      <p><strong>The Three Guṇas (Qualities)</strong></p>
      <p style={{ marginLeft: '24px', fontStyle: 'italic', color: '#666' }}>
        Sattva (light/pleasure), Rajas (motion/pain), Tamas (heaviness/delusion) &mdash;
        &ldquo;They function together like a lamp (wick, oil, and fire cooperating for light).&rdquo;
        (Verses 12–13)
      </p>

      <p><strong>The Lame Man and the Blind Man</strong></p>
      <p style={{ marginLeft: '24px', fontStyle: 'italic', color: '#666' }}>
        &ldquo;The Spirit (conscious but inactive) rides on Matter (active but unconscious)
        like a lame man riding a blind man.&rdquo; (Verses 19–21)
      </p>

      <p><strong>The Dancing Girl</strong></p>
      <p style={{ marginLeft: '24px', fontStyle: 'italic', color: '#666' }}>
        &ldquo;Just as a dancer stops dancing after she has been seen by the audience,
        Nature stops her activity once the Spirit realizes &apos;I am not this.&apos;&rdquo; (Verse 59)
      </p>

      <h2>The Transmission Lineage</h2>

      <p>
        The text itself records its transmission (Verses 70–72):
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '18px', lineHeight: 2 }}>
          <strong style={{ color: '#9e4a3a' }}>Kapila</strong> (legendary sage)
          <br />↓<br />
          <strong style={{ color: '#9e4a3a' }}>Āsuri</strong>
          <br />↓<br />
          <strong style={{ color: '#9e4a3a' }}>Pañcaśikha</strong>
          <br />↓<br />
          <strong style={{ color: '#9e4a3a' }}>Īśvarakṛṣṇa</strong> (author, ~4th c. CE)
        </div>
      </figure>

      <h2>Sample Transcription</h2>

      <p>
        Here are the opening verses from the manuscript in Malayalam script with romanization:
      </p>

      <figure style={{
        background: '#1a1612',
        color: '#f5f0e8',
        padding: '24px',
        borderRadius: '8px',
        margin: '32px 0',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: 1.8,
        overflowX: 'auto',
      }}>
        <p style={{ margin: '0 0 16px 0', color: '#9e8a7a' }}>{/* Invocation */}Invocation</p>
        <p style={{ margin: '0 0 8px 0' }}>ഹരിഃ ശ്രീ ഗണപതയേ നമഃ അവിഘ്നമസ്തു</p>
        <p style={{ margin: '0 0 16px 0', color: '#aaa', fontStyle: 'italic' }}>
          Hariḥ Śrī Gaṇapataye namaḥ avighnam astu
        </p>
        <p style={{ margin: '0 0 16px 0', color: '#9e8a7a' }}>Verse 1</p>
        <p style={{ margin: '0 0 8px 0' }}>ദുഃഖത്രയാഭിഘാതാജിജ്ഞാസാ തദപഘാതകേ ഹേതൗ</p>
        <p style={{ margin: '0 0 8px 0', color: '#aaa', fontStyle: 'italic' }}>
          duḥkhatrayābhighātājjijñāsā tadapaghātake hetau
        </p>
        <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
          &ldquo;Because of the assault of the Threefold Suffering, an inquiry arises into the means of terminating it...&rdquo;
        </p>
      </figure>

      <h2>The Colonial Mirror</h2>

      <p>
        The manuscript label&apos;s equation of Sāṃkhya with the Golden Verses of Pythagoras
        reveals less about the Indian text itself and more about how 19th-century British
        intellectuals tried to make sense of the East.
      </p>

      <h3>1. The Numerical Link</h3>
      <p>
        The most obvious bridge is etymological. <em>Sāṃkhya</em> means &ldquo;Enumeration&rdquo;
        (categorizing the 25 realities). Pythagoras is famous for the doctrine &ldquo;All is Number.&rdquo;
        For a colonial collector like Whish, this was likely the &ldquo;smoking gun&rdquo; of a
        historical connection.
      </p>

      <h3>2. The Dualistic Soul</h3>
      <p>
        Both systems are rigorously dualistic. They strictly separate the eternal, witness-soul
        (Puruṣa/Monad) from the changing, material world (Prakṛti/Dyad). The goal in both systems
        is to purify the soul from the contamination of matter.
      </p>

      <h3>3. Transmigration</h3>
      <p>
        The specific doctrine of <em>metempsychosis</em> (the soul moving from human to animal
        to plant based on conduct) is central to both Sāṃkhya (verses 53–54) and Pythagoreanism.
        In an era when Christianity dominated Western thought, finding two ancient, non-Christian
        systems sharing this specific belief suggested a shared ancient lineage to Orientalist scholars.
      </p>

      <h2>Modern Perspective</h2>

      <p>
        While modern scholarship views these as parallel developments rather than direct historical
        connections, the label on Whish No. 147 preserves a specific moment in history where the
        <em>Sāṃkhyakārikā</em> was read not just as Indian philosophy, but as the &ldquo;missing
        link&rdquo; to Western antiquity.
      </p>

      <p>
        This manuscript reminds us that every text exists in layers of interpretation. The
        <em>Sāṃkhyakārikā</em> is simultaneously:
      </p>

      <ul>
        <li>A 4th-century Indian philosophical treatise</li>
        <li>A Kerala scholarly tradition preserved on palm leaves</li>
        <li>A 19th-century Orientalist artifact labeled as &ldquo;Pythagoras&rdquo;</li>
        <li>A 21st-century digitized resource available worldwide</li>
      </ul>

      <p>
        The &ldquo;Golden Verses&rdquo; label was wrong in its historical claim but revealing
        in its intellectual ambition: to find unity in the ancient wisdom of East and West.
      </p>

      <h2>Further Reading</h2>

      <ul>
        <li>
          <strong>Larson, G.J. & Bhattacharya, R.S.</strong> (1987).
          <em>Sāṃkhya: A Dualist Tradition in Indian Philosophy</em>
          (Encyclopedia of Indian Philosophies, Vol. IV)
        </li>
        <li>
          <strong>Whish, C.M.</strong> (1835). &ldquo;On the Hindú Quadrature of the Circle&rdquo;
          <em>Transactions of the Royal Asiatic Society</em> 3(3): 509–523
        </li>
        <li>
          <a
            href="https://archive.org/details/RASWhishCollection"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9e4a3a' }}
          >
            Whish Collection at Internet Archive
          </a>
        </li>
      </ul>
    </BlogLayout>
  );
}
