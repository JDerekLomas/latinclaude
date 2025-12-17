import BlogLayout from "../BlogLayout";

export default function PhilosophySample() {
  return (
    <BlogLayout
      title="The Translation Gap in Renaissance Philosophy: A Random Sample"
      tag="Methodology"
      slug="philosophy-sample"
      prevPost={{ href: "/blog/natural-philosophy-sample", title: "Natural Philosophy Sample" }}
      nextPost={{ href: "/blog/roadmap", title: "Translation Roadmap" }}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        Following our random sample of Renaissance science works, I applied the same methodology to the &ldquo;Philosophy and Morality&rdquo; category in USTC. The results reveal a different pattern&mdash;and some surprising gaps.
      </p>

      {/* Key stat */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f0e8 0%, #e0d8c8 100%)',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '48px',
        margin: '32px 0',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#9e4a3a', marginBottom: '8px' }}>9,359</div>
        <div style={{ fontSize: '20px', color: '#444' }}>Philosophy & Morality works in USTC</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Nearly 3x the Science category (3,451 works)</div>
      </div>

      <h2>Methodology</h2>

      <div style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1a1612' }}>
          Sampling Parameters
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#444' }}>
          <li><strong style={{ color: '#1a1612' }}>Category:</strong> USTC &ldquo;Philosophy and Morality&rdquo;</li>
          <li><strong style={{ color: '#1a1612' }}>Population:</strong> 9,359 Latin editions</li>
          <li><strong style={{ color: '#1a1612' }}>Sample size:</strong> 25 works</li>
          <li><strong style={{ color: '#1a1612' }}>Seed:</strong> 2024 (reproducible)</li>
          <li><strong style={{ color: '#1a1612' }}>Method:</strong> Python <code style={{ fontFamily: 'Monaco, Courier, monospace', fontSize: '13px', background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>random.sample()</code></li>
        </ul>
      </div>

      <h2>The Sample: 25 Random Philosophy Works</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '32px 0',
      }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#e0d8c8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', color: '#1a1612' }}>Author</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#1a1612' }}>Work</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#1a1612' }}>Year</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#1a1612' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Translated works */}
            <tr style={{ borderBottom: '1px solid #e0d8c8', background: '#2ecc7115' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Lipsius, Justus</td>
              <td style={{ padding: '12px' }}>De constantia libri duo</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1613</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#2ecc71', fontWeight: 600 }}>Translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8', background: '#2ecc7115' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Erasmus, Desiderius</td>
              <td style={{ padding: '12px' }}>Parabolae sive similia</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1521</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#2ecc71', fontWeight: 600 }}>Translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8', background: '#2ecc7115' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Paolo Veneto</td>
              <td style={{ padding: '12px' }}>Logica</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1522</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#546b8a', fontWeight: 600 }}>Partial</td>
            </tr>

            {/* Medieval/Classical reprints */}
            <tr style={{ borderBottom: '1px solid #e0d8c8', background: '#c9a86c15' }}>
              <td style={{ padding: '12px' }}>Boethius</td>
              <td style={{ padding: '12px' }}>De consolatione (commentary edition)</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1503</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#c9a86c' }}>Medieval</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8', background: '#c9a86c15' }}>
              <td style={{ padding: '12px' }}>Anonymous</td>
              <td style={{ padding: '12px' }}>Aristotelis Opera (paraphrase)</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1668</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#c9a86c' }}>Classical</td>
            </tr>

            {/* Notable untranslated */}
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Groot, Hugo de (Grotius)</td>
              <td style={{ padding: '12px' }}>Scutum Auriacum</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1597</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Wallis, John</td>
              <td style={{ padding: '12px' }}>Serenissimo Regi Carolo (oration)</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1662</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Blackburne, Richard</td>
              <td style={{ padding: '12px' }}>Vita Hobbes (biography of Hobbes)</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1682</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Magirus, Johann</td>
              <td style={{ padding: '12px' }}>Physiologiae Peripateticae libri sex</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1616</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>Case, John</td>
              <td style={{ padding: '12px' }}>Lapis philosophicus (Aristotle commentary)</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1629</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px' }}>Senguerdius, Arnoldus</td>
              <td style={{ padding: '12px' }}>Idea metaphysicae generalis</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1647</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px' }}>Grau, Abraham de</td>
              <td style={{ padding: '12px' }}>Historia Philosophica</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1674</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px' }}>Schneegaß, Elias</td>
              <td style={{ padding: '12px' }}>Logica Antiaristotelica</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1686</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#9e4a3a' }}>Not translated</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                + 12 more untranslated works (logic textbooks, metaphysics manuals, theses)
              </td>
            </tr>
          </tbody>
        </table>
      </figure>

      <h2>Results Summary</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '24px',
        margin: '32px 0',
        textAlign: 'center',
      }}>
        <div style={{ background: '#2ecc7115', border: '1px solid #2ecc71', borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2ecc71' }}>3</div>
          <div style={{ fontSize: '14px', color: '#444' }}>Translated</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Lipsius, Erasmus, Paolo Veneto</div>
        </div>
        <div style={{ background: '#c9a86c15', border: '1px solid #c9a86c', borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c9a86c' }}>2</div>
          <div style={{ fontSize: '14px', color: '#444' }}>Medieval/Classical</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Boethius, Aristotle</div>
        </div>
        <div style={{ background: '#9e4a3a15', border: '1px solid #9e4a3a', borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#9e4a3a' }}>20</div>
          <div style={{ fontSize: '14px', color: '#444' }}>Not Translated</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Including Grotius, Wallis</div>
        </div>
        <div style={{ background: '#1a161215', border: '1px solid #1a1612', borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1612' }}>12%</div>
          <div style={{ fontSize: '14px', color: '#444' }}>Translation Rate</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Renaissance-original</div>
        </div>
      </div>

      <h2>Key Observations</h2>

      <div style={{
        background: '#f5f0e8',
        border: '1px solid #c9a86c',
        borderLeft: '4px solid #c9a86c',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#c9a86c' }}>
          The Philosophy Paradox
        </h3>
        <p style={{ color: '#444', marginBottom: '16px' }}>
          You might expect philosophy to have better translation coverage than science. After all, philosophers like Erasmus, Lipsius, and Grotius are famous names. But the sample reveals a structural problem:
        </p>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#444' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#1a1612' }}>Only the &ldquo;greatest hits&rdquo; get translated:</strong> Lipsius&apos;s <em>De constantia</em> has multiple translations. His 4,000+ letters? Almost entirely untranslated.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#1a1612' }}>University textbooks are invisible:</strong> Magirus&apos;s <em>Physiologiae Peripateticae</em> was used in universities across Europe. Never translated.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#1a1612' }}>Logic and metaphysics are orphaned:</strong> 8 of our 25 samples were logic or metaphysics textbooks. Zero translations.
          </li>
          <li>
            <strong style={{ color: '#1a1612' }}>Even famous authors have gaps:</strong> Grotius&apos;s early work <em>Scutum Auriacum</em> (1597) remains untranslated.
          </li>
        </ol>
      </div>

      <h2>Notable Untranslated Works</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        margin: '32px 0',
      }}>
        <div style={{
          background: '#fff',
          border: '2px solid #9e4a3a',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#9e4a3a', marginBottom: '8px' }}>
            Johann Magirus: Physiologiae Peripateticae (1616)
          </h3>
          <p style={{ color: '#444', fontSize: '14px', marginBottom: '16px' }}>
            A standard Aristotelian physics textbook used at the Academy of Marburg and universities across Protestant Europe. Six books covering the entire scope of Peripatetic natural philosophy.
          </p>
          <p style={{ color: '#888', fontSize: '13px' }}>
            <strong>Why it matters:</strong> This is what Renaissance students actually read. Understanding the textbook tradition is essential for intellectual history.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #9e4a3a',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#9e4a3a', marginBottom: '8px' }}>
            Richard Blackburne: Vita Hobbes (1682)
          </h3>
          <p style={{ color: '#444', fontSize: '14px', marginBottom: '16px' }}>
            One of the earliest biographies of Thomas Hobbes, written by a contemporary. Essential primary source for understanding how Hobbes was perceived in his own time.
          </p>
          <p style={{ color: '#888', fontSize: '13px' }}>
            <strong>Why it matters:</strong> Hobbes scholars work primarily from his own writings. This external perspective remains largely inaccessible.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #c9a86c',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#c9a86c', marginBottom: '8px' }}>
            John Case: Lapis philosophicus (1629)
          </h3>
          <p style={{ color: '#444', fontSize: '14px', marginBottom: '16px' }}>
            An Oxford commentary on Aristotle&apos;s eight books of Physics. Case was a major figure in late Elizabethan Oxford philosophy.
          </p>
          <p style={{ color: '#888', fontSize: '13px' }}>
            <strong>Why it matters:</strong> English-language philosophy has its own Latin tradition that remains untranslated into... English.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #c9a86c',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, color: '#c9a86c', marginBottom: '8px' }}>
            Elias Schneegaß: Logica Antiaristotelica (1686)
          </h3>
          <p style={{ color: '#444', fontSize: '14px', marginBottom: '16px' }}>
            An anti-Aristotelian logic from Rinteln. Part of the ferment of logical innovation in the 17th century that would eventually lead to Leibniz and modern logic.
          </p>
          <p style={{ color: '#888', fontSize: '13px' }}>
            <strong>Why it matters:</strong> The history of logic focuses on a few famous names. Works like this show the broader context of logical debate.
          </p>
        </div>
      </div>

      <h2>Comparison with Science Sample</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '32px 0',
      }}>
        <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#e0d8c8' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px', color: '#1a1612' }}>Category</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#1a1612' }}>USTC Works</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#1a1612' }}>Sample</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#1a1612' }}>Translated</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#1a1612' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px' }}>Science</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>3,451</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>25</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#546b8a' }}>4</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#546b8a' }}>18%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0d8c8' }}>
              <td style={{ padding: '12px' }}>Philosophy & Morality</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>9,359</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>25</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#546b8a' }}>3</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#546b8a' }}>12%</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', fontWeight: 600 }}>Combined</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>12,810</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px' }}>50</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#9e4a3a' }}>7</td>
              <td style={{ textAlign: 'right', fontFamily: 'Monaco, Courier, monospace', padding: '12px', color: '#9e4a3a' }}>14%</td>
            </tr>
          </tbody>
        </table>
      </figure>

      <p>
        Both categories show translation rates well above the 2% baseline for general USTC, but for different reasons:
      </p>

      <ul>
        <li><strong style={{ color: '#1a1612' }}>Science:</strong> 17th-century English interest in alchemy and natural magic drove early translations</li>
        <li><strong style={{ color: '#1a1612' }}>Philosophy:</strong> Famous humanists (Erasmus, Lipsius) have comprehensive translation projects</li>
      </ul>

      <p>
        But in both cases, the &ldquo;long tail&rdquo;&mdash;textbooks, commentaries, minor works&mdash;remains almost entirely untranslated.
      </p>

      <h2>Recommendations for Translation Roadmap</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        margin: '32px 0',
      }}>
        <div style={{
          background: '#fff',
          border: '2px solid #9e4a3a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#9e4a3a', fontWeight: 600, marginBottom: '4px' }}>HIGH PRIORITY</div>
          <h4 style={{ fontSize: '18px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>
            University Textbook Anthology
          </h4>
          <p style={{ color: '#444', fontSize: '14px' }}>
            Selections from Magirus, Senguerdius, Horneius, and other standard textbooks. Would reveal what Renaissance students actually learned.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #9e4a3a',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#9e4a3a', fontWeight: 600, marginBottom: '4px' }}>HIGH PRIORITY</div>
          <h4 style={{ fontSize: '18px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>
            Blackburne: Vita Hobbes
          </h4>
          <p style={{ color: '#444', fontSize: '14px' }}>
            Early biography of Hobbes. Short, significant, built-in audience of Hobbes scholars. Good quick win.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #c9a86c',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#c9a86c', fontWeight: 600, marginBottom: '4px' }}>MEDIUM PRIORITY</div>
          <h4 style={{ fontSize: '18px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>
            Anti-Aristotelian Logic Collection
          </h4>
          <p style={{ color: '#444', fontSize: '14px' }}>
            Schneegaß and similar critics. The logical revolution of the 17th century had many contributors beyond Descartes and Leibniz.
          </p>
        </div>

        <div style={{
          background: '#fff',
          border: '2px solid #c9a86c',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#c9a86c', fontWeight: 600, marginBottom: '4px' }}>MEDIUM PRIORITY</div>
          <h4 style={{ fontSize: '18px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, marginBottom: '8px' }}>
            Grau: Historia Philosophica
          </h4>
          <p style={{ color: '#444', fontSize: '14px' }}>
            A 1674 history of philosophy. How did early modern scholars understand their own philosophical tradition?
          </p>
        </div>
      </div>

      <h2>The Broader Pattern</h2>

      <p>
        Random sampling across two categories confirms our hypothesis: <strong style={{ color: '#9e4a3a' }}>the translation rate for Renaissance Latin is not 2% because we lack interest in the period&mdash;it&apos;s 2% because we only translate the famous names.</strong>
      </p>

      <p>
        The infrastructure of Renaissance intellectual life&mdash;the textbooks, the commentaries, the disputations&mdash;remains almost entirely inaccessible to non-Latinists. This isn&apos;t a gap in our knowledge of a few obscure figures. It&apos;s a systematic blindspot in our understanding of how ideas were actually taught, debated, and transmitted.
      </p>

      <div style={{
        background: '#1a1612',
        color: '#f5f0e8',
        borderRadius: '8px',
        padding: '32px',
        margin: '32px 0',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', margin: 0 }}>
          &ldquo;We have Erasmus, but not what Renaissance students read about Erasmus.<br />
          We have Aristotle, but not how Renaissance universities taught Aristotle.&rdquo;
        </p>
      </div>

      <h2>Reproducibility</h2>

      <pre style={{
        fontFamily: 'Monaco, Courier, monospace',
        fontSize: '13px',
        background: '#1a1612',
        color: '#f5f0e8',
        padding: '24px',
        borderRadius: '8px',
        overflow: 'auto',
        margin: '32px 0',
      }}>
{`import pandas as pd
import random

df = pd.read_csv('ustc_latin_editions.csv', low_memory=False)

# Filter for Philosophy and Morality
philosophy = df[df['classification_1'] == 'Philosophy and Morality']
print(f"Philosophy works: {len(philosophy)}")  # 9,359

# Random sample
random.seed(2024)
sample = philosophy.iloc[random.sample(range(len(philosophy)), 25)]

for _, row in sample.iterrows():
    print(f"{row['author_name_1']}: {row['std_title']}")`}
      </pre>

      <p>
        See also: <a href="/blog/natural-philosophy-sample" style={{ color: '#9e4a3a' }}>Natural Philosophy Sample</a> | <a href="/blog/methodology" style={{ color: '#9e4a3a' }}>Full Methodology</a>
      </p>
    </BlogLayout>
  );
}
