import BlogLayout from "../BlogLayout";

export default function SanskritManuscripts() {
  return (
    <BlogLayout
      title="30 Million Manuscripts: India's NAMAMI Database and the Future of Sanskrit"
      tag="Research"
      slug="sanskrit-manuscripts"
      prevPost={{ href: "/blog/roadmap", title: "Translation Roadmap" }}
      nextPost={{ href: "/blog/methodology", title: "Methodology" }}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        Sanskrit manuscripts outnumber Greek and Latin combined by 100 to 1. India&apos;s National
        Mission for Manuscripts (NAMAMI) is cataloguing this ocean of knowledge&mdash;and much of it
        is now searchable online. Here&apos;s how to access it.
      </p>

      <h2>The Scale</h2>

      <p>
        &ldquo;Extant manuscripts in Sanskrit number over 30 million, one hundred times those in
        Greek and Latin combined, constituting the largest cultural heritage that any civilization
        has produced prior to the invention of the printing press.&rdquo;
      </p>

      <p style={{ fontSize: '14px', color: '#666', marginTop: '-8px' }}>
        &mdash; G&eacute;rard Huet, Amba Kulkarni &amp; Peter Scharf, <em>Sanskrit Computational Linguistics</em> (2009)
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Metric</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Sanskrit</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Latin (USTC)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Estimated manuscripts", "30+ million", "~500,000"],
              ["Catalogued", "~5 million", "~500,000"],
              ["Digitized", "~350,000", "~200,000"],
              ["Freely accessible online", "~76,000", "~150,000"],
              ["Translated to English", "<1%", "~3%"],
            ].map(([metric, sanskrit, latin], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{metric}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#9e4a3a', fontFamily: 'monospace', fontWeight: 600 }}>{sanskrit}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#666', fontFamily: 'monospace' }}>{latin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>What is NAMAMI?</h2>

      <p>
        The <strong>National Mission for Manuscripts</strong> (NAMAMI) was established in 2003 by
        India&apos;s Ministry of Culture. Its mandate: locate, document, conserve, and disseminate
        India&apos;s manuscript heritage. In 2025, it was renamed the <strong>Gyan Bharatam Mission</strong> with
        &pound;483 crore (~$58M) funding to digitize 10 million manuscripts by 2031.
      </p>

      <p>
        The mission operates <strong>Kriti Sampada</strong>, the National Database of Manuscripts,
        containing 4.4 million records. Of these, 316,585 manuscripts have been digitized (33+ million
        pages), and 76,000 are freely accessible to the public.
      </p>

      <h2>How to Access the Database</h2>

      <p>
        The official search interface is at <a href="https://www.pandulipipatala.nic.in" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>pandulipipatala.nic.in</a>.
        However, the interface is JavaScript-heavy and can be difficult to navigate. Here&apos;s the trick:
      </p>

      <figure style={{
        background: '#fff',
        border: '2px solid #9e4a3a',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#9e4a3a' }}>The Key Trick (from INDOLOGY mailing list)</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
          <li>Go to <a href="https://www.pandulipipatala.nic.in/advance-search" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>pandulipipatala.nic.in/advance-search</a></li>
          <li>Set <strong>Digitization = Yes</strong></li>
          <li>Set <strong>Public View = Yes</strong></li>
          <li>This filters to the ~76,000 manuscripts that are BOTH digitized AND publicly viewable</li>
          <li>Filter further by <strong>Subject</strong> (e.g., Dar&#347;ana &gt; Ny&#257;ya for logic)</li>
        </ol>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '16px', marginBottom: 0 }}>
          Note: The site requires JavaScript and can be slow. Some features may require registration.
        </p>
      </figure>

      <h2>Alternative: Archive.org Collections</h2>

      <p>
        If the government portal is frustrating, <strong>Archive.org has actual manuscript images</strong> that
        are freely downloadable. The <a href="https://archive.org/details/palmleafmanuscripts" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Royal Asiatic Society Whish Collection</a> contains
        Sanskrit palm leaf manuscripts from Kerala, digitized by the RAS London:
      </p>

      <figure style={{
        background: '#f9f7f4',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a1612' }}>Sample Manuscripts (10 Downloaded)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish101-100" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/nyaya_philosophy_p1.jpg" alt="Nyaya philosophy palm leaf manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Ny&#257;ya Philosophy</strong><br/>
              Logic treatise, Grantha script
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish145-147" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/tarkasangraha_p1.jpg" alt="Tarkasangraha palm leaf manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Tarkasa&#7749;graha</strong><br/>
              Logic primer, Malayalam, 1822
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish193-167" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/brahmasutra_p1.jpg" alt="Brahmasutra commentary manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Brahmas&#363;tracandrik&#257;</strong><br/>
              Ved&#257;nta commentary
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish113-111" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/vedantasara_p1.jpg" alt="Vedantasara manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Ved&#257;ntas&#257;ra</strong><br/>
              Essence of Ved&#257;nta
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish150-152" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/tantrasamuccaya_p1.jpg" alt="Tantrasamuccaya manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Tantrasamuccaya</strong><br/>
              Ritual manual, Kerala
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="https://archive.org/details/raswhish88-87" target="_blank" rel="noopener noreferrer">
              <img src="/manuscripts/skanda_purana_p1.jpg" alt="Skanda Purana manuscript" style={{ width: '100%', borderRadius: '4px', border: '1px solid #e0d8c8' }} />
            </a>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
              <strong>Skanda Pur&#257;&#7751;a</strong><br/>
              Palm leaf, Grantha script
            </p>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '16px', marginBottom: 0, textAlign: 'center' }}>
          <a href="https://archive.org/details/palmleafmanuscripts?and%5B%5D=languageSorter%3A%22Sanskrit%22" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
            Browse all Sanskrit palm leaf manuscripts on Archive.org &rarr;
          </a>
        </p>
      </figure>

      <h3>How to Download Manuscript Images</h3>

      <p>
        For any Archive.org item (e.g., <code style={{ background: '#f5f0e8', padding: '2px 6px', borderRadius: '3px' }}>raswhish145-147</code>), you can download page images directly:
      </p>

      <pre style={{
        background: '#1a1612',
        color: '#e8e4dc',
        padding: '16px',
        borderRadius: '4px',
        fontSize: '13px',
        overflowX: 'auto',
        margin: '16px 0'
      }}>
{`# Download page 1 as JPG
curl -L "https://archive.org/download/raswhish145-147/page/n0.jpg" -o page1.jpg

# Download page 10
curl -L "https://archive.org/download/raswhish145-147/page/n10.jpg" -o page10.jpg`}
      </pre>

      <figure style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a1612' }}>NAMAMI Search Fields</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
          <li>Filter by <strong>Subject</strong> (e.g., Dar&#347;ana &gt; Ny&#257;ya for logic)</li>
          <li>Filter by <strong>Language</strong> (200+ options including Sanskrit, Pali, Prakrit)</li>
          <li>Filter by <strong>Script</strong> (50+ options including Devanagari, Grantha, Sharada)</li>
        </ol>
      </figure>

      <h3>Search Fields Available</h3>

      <ul>
        <li><strong>Title / Author</strong> &ndash; Search by work name or author</li>
        <li><strong>Subject</strong> &ndash; 400+ categories in hierarchical taxonomy</li>
        <li><strong>Language</strong> &ndash; 200+ languages from Sanskrit to Zou</li>
        <li><strong>Script</strong> &ndash; 50+ scripts (Devanagari, Arabic, Tibetan, etc.)</li>
        <li><strong>Material</strong> &ndash; Palm leaf, birch bark, paper, copper plate</li>
        <li><strong>Condition</strong> &ndash; Acidic, brittle, fungal, worm-eaten</li>
        <li><strong>Repository</strong> &ndash; 200+ Manuscript Resource Centers across India</li>
        <li><strong>Date</strong> &ndash; Multiple calendar systems (Vikram Samvat, Shaka, Gregorian)</li>
      </ul>

      <h2>Subject Classification System</h2>

      <p>
        NAMAMI uses a detailed hierarchical taxonomy. Here are the major categories relevant to
        philosophy, logic, and the history of ideas:
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Category</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Subcategories</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Dar&#347;ana (Philosophy)", "S&#257;&#7747;khya, Yoga, Ny&#257;ya, Vai&#347;e&#7779;ika, M&#299;m&#257;&#7747;s&#257;, Ved&#257;nta, Buddhist, Jaina, C&#257;rv&#257;ka"],
              ["Ved&#257;&#7749;ga (Auxiliary)", "&#346;ik&#7779;&#257; (phonetics), Vy&#257;kara&#7751;a (grammar), Nirukta (etymology), Jyoti&#7779;a (astronomy), Kalpa (ritual), Chandas (prosody)"],
              ["Upaveda (Applied)", "&#256;yurveda (medicine), Dhanurveda (archery), G&#257;ndharvaveda (music), Artha&#347;&#257;stra (economics)"],
              ["Vij&ntilde;&#257;na (Sciences)", "Ga&#7751;ita (mathematics), V&#257;stu&#347;&#257;stra (architecture), chemistry, botany, geography"],
              ["Tantra / &#256;gama", "Ritual texts, mystical practices, &#346;aiva, Vai&#7779;&#7751;ava, &#346;&#257;kta traditions"],
              ["K&#257;vya (Literature)", "Poetry, drama, aesthetics (Ala&#7749;k&#257;ra&#347;&#257;stra), narrative"],
            ].map(([cat, subs], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: cat }} />
                <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: subs }} />
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>AI-Relevant Texts: Ny&#257;ya (Logic)</h2>

      <p>
        The <strong>Ny&#257;ya</strong> tradition is India&apos;s formal logic system, developed over
        two millennia. It includes syllogistic reasoning, epistemology, debate rules, and semantic
        theory. The later <strong>Navya-Ny&#257;ya</strong> (&ldquo;New Logic&rdquo;) developed a
        technical language of extraordinary precision&mdash;some scholars compare it to predicate logic.
      </p>

      <p>
        A <a href="https://archive.org/details/dli.ministry.28111" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
        1993 Bibliography of Ny&#257;ya Philosophy</a> by Krishna Chakravorty Ganguly documents:
      </p>

      <figure style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Ny&#257;ya Tradition</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Documents</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Manuscripts</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Navya-Ny&#257;ya (New Logic)", "1,020", "517"],
              ["Pr&#257;c&#299;na Ny&#257;ya (Old Logic)", "566", "181"],
              ["Ny&#257;ya-Vai&#347;e&#7779;ika", "472", "216"],
              ["Bauddha Ny&#257;ya (Buddhist Logic)", "177", "70"],
              ["Jaina Ny&#257;ya", "83", "46"],
              ["Comparative / Logic", "40", "—"],
            ].map(([tradition, docs, mss], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }} dangerouslySetInnerHTML={{ __html: tradition }} />
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{docs}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#9e4a3a' }}>{mss}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 600 }}>
              <td style={{ padding: '12px 8px', color: '#1a1612' }}>Total</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace' }}>2,358</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#9e4a3a' }}>1,030</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '16px', marginBottom: 0 }}>
          Source: Ganguly, <em>A Bibliography of Ny&#257;ya Philosophy</em> (National Library, Calcutta, 1993)
        </p>
      </figure>

      <h3>Key Ny&#257;ya Texts</h3>

      <ul>
        <li><strong>Ny&#257;ya S&#363;tra</strong> (Gautama, c. 200 BCE) &ndash; Foundational text. 528 aphorisms on logic, epistemology, debate.</li>
        <li><strong>Ny&#257;ya Bh&#257;&#7779;ya</strong> (V&#257;tsy&#257;yana, c. 450 CE) &ndash; First major commentary.</li>
        <li><strong>Ny&#257;ya V&#257;rttika</strong> (Uddyotakara, c. 550 CE) &ndash; Defense against Buddhist critiques.</li>
        <li><strong>Tattvacint&#257;ma&#7751;i</strong> (Ga&#7749;ge&#347;a, 13th c.) &ndash; <em>Jewel of Thought on Reality</em>. Founded Navya-Ny&#257;ya.</li>
        <li><strong>Tattvacint&#257;ma&#7751;i-D&#299;dhiti</strong> (Raghun&#257;tha, 16th c.) &ndash; Major commentary, developed the technical language.</li>
      </ul>

      <h2>Critical Editions Published by NAMAMI</h2>

      <p>
        NAMAMI publishes critical editions of rare manuscripts in the <strong>Prakashika</strong> series.
        As of 2024, 60+ volumes have been published. Here are the logic/philosophy texts:
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>#</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Title</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Editor</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Subject</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["4", "Pak&#7779;at&#257;cint&#257;ma&#7751;i & S&#257;m&#257;nyanirukti", "Subudhi Charan Goswami", "Ny&#257;ya philosophy"],
              ["40", "Tattvacint&#257;ma&#7751;i-D&#299;dhiti-Prak&#257;&#347;a-Sarvopak&#257;ri&#7751;&#299;", "Hareram Tripathi", "Navya-Ny&#257;ya"],
              ["41", "Nanv&#257;dat&#299;ppa&#7751;&#299; of R&#257;macandra", "Sujata Banerjee", "Ny&#257;ya commentary"],
              ["44", "Brahmasiddh&#257;nta", "Somenath Chatterjee", "Ved&#257;nta"],
              ["50", "Lakul&#299;&#347;apravartitam P&#257;&#347;upatatantram", "Brijesh Kumar Shukla", "&#346;aiva philosophy"],
            ].map(([num, title, editor, subj], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#666' }}>{num}</td>
                <td style={{ padding: '12px 8px', color: '#1a1612' }} dangerouslySetInnerHTML={{ __html: title }} />
                <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }}>{editor}</td>
                <td style={{ padding: '12px 8px', color: '#9e4a3a', fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: subj }} />
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <p>
        The <strong>Tattvacint&#257;ma&#7751;i-D&#299;dhiti-Prak&#257;&#347;a</strong> (#40) is particularly
        significant&mdash;it&apos;s a commentary on Raghun&#257;tha&apos;s commentary on Ga&#7749;ge&#347;a&apos;s
        foundational Navya-Ny&#257;ya text. This is the heart of Indian formal logic.
      </p>

      <h2>Major Repositories</h2>

      <figure style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Repository</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Location</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Manuscripts</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Kailashsuri Jnanamandir", "Koba, Gujarat", "250,000"],
              ["Saraswati Bhavan Library", "Varanasi", "90,000"],
              ["L.D. Institute of Indology", "Ahmedabad", "80,000"],
              ["Saraswati Mahal Library", "Thanjavur", "49,000"],
              ["Rajasthan ORI", "Jodhpur", "48,000"],
              ["Bhandarkar ORI", "Pune", "29,000"],
              ["University of Calcutta", "Kolkata", "28,000"],
            ].map(([repo, loc, count], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{repo}</td>
                <td style={{ padding: '12px 8px', color: '#666' }}>{loc}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#9e4a3a' }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>Other Resources</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a1612' }}>Best Places to Find Actual Manuscript Images</h3>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0d8c8' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Source</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>What&apos;s There</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Access</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Archive.org Palm Leaf Collection", "RAS Whish manuscripts (Kerala, 19th c.)", "Free, downloadable"],
              ["Archive.org IGNCA Collection", "ASI Sanskrit texts, catalogues", "Free, downloadable"],
              ["sanskritdocuments.org", "175+ scanned books, DLI mirror", "Free, downloadable"],
              ["BDRC (library.bdrc.io)", "Tibetan + Sanskrit Buddhist texts", "Free, online viewer"],
              ["Cambridge Digital Library", "1,600+ South Asian manuscripts", "Free, online viewer"],
              ["NAMAMI (pandulipipatala.nic.in)", "76,000 publicly viewable", "Free, JavaScript required"],
            ].map(([source, content, access], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }}>{source}</td>
                <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }}>{content}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#9e4a3a', fontSize: '13px' }}>{access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <ul>
        <li>
          <strong><a href="https://archive.org/details/palmleafmanuscripts?and%5B%5D=languageSorter%3A%22Sanskrit%22" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Archive.org Sanskrit Palm Leaf Collection</a></strong> &ndash; Actual manuscript images, freely downloadable
        </li>
        <li>
          <strong><a href="https://sanskritdocuments.org/scannedbooks/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Sanskrit Documents Scanned Books</a></strong> &ndash; 175+ Sanskrit books, mirrors 422,000 PDFs from Digital Library of India
        </li>
        <li>
          <strong><a href="https://archive.org/details/india-office-sanskrit-manuscripts-catalouge" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          India Office Sanskrit Catalogue</a></strong> &ndash; British Library&apos;s 80,000+ South Asian manuscripts
        </li>
        <li>
          <strong><a href="https://cudl.lib.cam.ac.uk/collections/sanskrit" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Cambridge Digital Library</a></strong> &ndash; 1,600+ Sanskrit works being digitized
        </li>
        <li>
          <strong><a href="https://library.bdrc.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Buddhist Digital Resource Center (BDRC)</a></strong> &ndash; Tibetan + Sanskrit Buddhist manuscripts
        </li>
        <li>
          <strong><a href="https://www.aai.uni-hamburg.de/en/forschung/ngmcp" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          NGMCP Hamburg</a></strong> &ndash; 180,000 Nepalese manuscripts microfilmed
        </li>
        <li>
          <strong><a href="https://indology.info/scanned-catalogues/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          INDOLOGY Scanned Catalogues</a></strong> &ndash; Collection of historical manuscript catalogues
        </li>
        <li>
          <strong><a href="https://archive.org/details/dli.ministry.28111" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Bibliography of Ny&#257;ya Philosophy</a></strong> &ndash; 2,358 documents catalogued (1993)
        </li>
      </ul>

      <h2>The Gap</h2>

      <p>
        Of 30+ million Sanskrit manuscripts:
      </p>

      <ul>
        <li>~5 million catalogued (17%)</li>
        <li>~350,000 digitized (1.2%)</li>
        <li>~76,000 freely accessible (0.25%)</li>
        <li>Translated to English: <strong>a tiny fraction of 1%</strong></li>
      </ul>

      <p>
        Compare this to Renaissance Latin, where we estimate ~3% translation rates as scandalously
        low. Sanskrit&apos;s situation is an order of magnitude more severe.
      </p>

      <h2>Digitized Texts Ready for Translation</h2>

      <p>
        We&apos;ve identified <strong>27 high-priority Sanskrit texts</strong> on Archive.org that are
        digitized and ready for translation work. See the full list in our{' '}
        <a href="/blog/roadmap" style={{ color: '#9e4a3a' }}>Translation Roadmap</a> under
        &ldquo;Sanskrit Logic &amp; Philosophy of Mind.&rdquo;
      </p>

      <h3>Top 3 Priorities</h3>

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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Text</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Why It Matters</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }}>
                <a href="https://archive.org/details/ZtQL_syadvada-manjari-of-shri-mallisena-suri-hindi-trans.-by-dr.-jagadisha-jain-shri-ravaji-bhai-des" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
                  Sy&#257;dv&#257;da-ma&ntilde;jar&#299;
                </a>
              </td>
              <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }}>7-valued logic (Saptabha&#7749;g&#299;) &mdash; 2000 years before &#321;ukasiewicz</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#9e4a3a', fontWeight: 600 }}>UNTRANSLATED</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }}>
                <a href="https://archive.org/details/pramanyavadagadadharatattvachintamanigangesadidhitied.ananthacharyap.b.checked_202003_640_Y" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
                  Tattvacint&#257;ma&#7751;i-D&#299;dhiti
                </a>
              </td>
              <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }}>Core of Navya-Ny&#257;ya formal logic &mdash; India&apos;s &ldquo;Principia Mathematica&rdquo;</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#9e4a3a', fontWeight: 600 }}>UNTRANSLATED</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 8px', color: '#1a1612', fontWeight: 500 }}>
                <a href="https://archive.org/details/PramanaVarttikaAcharyaDharmakirti" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
                  Pram&#257;&#7751;av&#257;rttika
                </a>
              </td>
              <td style={{ padding: '12px 8px', color: '#444', fontSize: '13px' }}>Apoha theory &mdash; meaning through exclusion, anticipates contrastive learning</td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#9e4a3a', fontWeight: 600 }}>PARTIAL</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <h3>AI-Relevant Categories</h3>

      <ul>
        <li><strong>Philosophy of Language</strong> &ndash; V&#257;kyapad&#299;ya (Spho&#7789;a theory: meaning as holistic &ldquo;burst&rdquo;)</li>
        <li><strong>Many-Valued Logic</strong> &ndash; Jain Sy&#257;dv&#257;da (7 truth values for uncertainty)</li>
        <li><strong>Formal Inference</strong> &ndash; Navya-Ny&#257;ya (technical metalanguage for inference rules)</li>
        <li><strong>Cognitive Architecture</strong> &ndash; Abhidharmako&#347;a (75 mental factors: attention, memory, reasoning)</li>
        <li><strong>Exclusion Semantics</strong> &ndash; Buddhist Apoha (&ldquo;cow&rdquo; = &ldquo;not non-cow&rdquo;)</li>
        <li><strong>Algorithmic Thinking</strong> &ndash; &#346;ulba S&#363;tras (geometric algorithms with rope/stakes)</li>
      </ul>

      <h2>Next Steps</h2>

      <p>
        We&apos;re now working with these digitized texts:
      </p>

      <ol>
        <li><strong>Download PDFs</strong> &ndash; All 27 texts are freely available on Archive.org</li>
        <li><strong>OCR &amp; digitize</strong> &ndash; Many scans need text extraction for machine processing</li>
        <li><strong>Translate priorities</strong> &ndash; Starting with Tarkasa&#7749;graha (15-page primer) and Sy&#257;dv&#257;da-ma&ntilde;jar&#299;</li>
        <li><strong>Build parallel corpus</strong> &ndash; Sanskrit-English aligned texts for training</li>
      </ol>

      <p>
        The 1,000+ Ny&#257;ya manuscripts documented by Ganguly represent a treasure trove for
        understanding formal reasoning traditions outside the Greek-Latin lineage. Most remain
        untranslated. This is the work.
      </p>

      <p style={{ marginTop: '32px' }}>
        <a href="/blog/roadmap" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#9e4a3a',
          color: '#fff',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500
        }}>
          View Full Sanskrit Roadmap &rarr;
        </a>
      </p>

      <h2>Sources</h2>

      <ul style={{ fontSize: '14px', lineHeight: 1.8 }}>
        <li>
          <a href="https://www.namami.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          National Mission for Manuscripts (NAMAMI)</a>
        </li>
        <li>
          <a href="https://www.pandulipipatala.nic.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Pandulipi Patala &ndash; National Database of Manuscripts</a>
        </li>
        <li>
          <a href="https://archive.org/details/dli.ministry.28111" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          Ganguly, <em>A Bibliography of Ny&#257;ya Philosophy</em> (1993)</a>
        </li>
        <li>
          <a href="https://en.wikipedia.org/wiki/Catalogus_Catalogorum" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>
          New Catalogus Catalogorum</a> &ndash; 42-volume Sanskrit works register
        </li>
        <li>
          Huet, Kulkarni &amp; Scharf, <em>Sanskrit Computational Linguistics</em> (Springer, 2009)
        </li>
      </ul>
    </BlogLayout>
  );
}
