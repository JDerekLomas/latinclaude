import BlogLayout from "../BlogLayout";

export default function ForgottenAuthors() {
  return (
    <BlogLayout
      title="The Forgotten Giants: Prolific Authors You've Never Heard Of"
      tag="Research"
      prevPost={{ href: "/blog/why-latin-matters", title: "Why Latin Matters" }}
      nextPost={{ href: "/blog/forgotten-1400s", title: "Forgotten Authors of the 1400s" }}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        Jakob Martini wrote 836 works. Johann Gerhard wrote 697. Samuel Stryk wrote 642.
        You&apos;ve never read a word they wrote—because almost none of it has been translated.
      </p>

      <h2>The Numbers</h2>

      <p>
        When we analyze the Universal Short Title Catalogue, a striking pattern emerges.
        The most prolific Latin authors of the Renaissance aren&apos;t the names in our textbooks.
        Yes, Cicero leads with 4,659 editions and Erasmus follows with 2,825—authors we
        recognize, whose work has been translated and studied.
      </p>

      <p>
        But just below them is a vast tier of authors who published hundreds of works each,
        shaped their fields for generations, and are now almost entirely unknown outside
        specialist circles.
      </p>

      <h2>The Forgotten 181</h2>

      <p>
        We identified <strong>181 neo-Latin authors</strong> who each
        published 100 or more works but are not classical authors (like Virgil or Ovid) and
        are not among the handful of Renaissance figures with substantial modern translations
        (like Erasmus or Luther).
      </p>

      <p>Here are the top 20:</p>

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
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Works</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Field</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Jakob Martini", "836", "Theology, Philosophy"],
              ["Johann Gerhard", "697", "Lutheran Theology"],
              ["Johann Deutschmann", "660", "Theology"],
              ["Samuel Stryk", "642", "Law"],
              ["Rudolph Goclenius", "571", "Medicine, Philosophy"],
              ["Abraham Calov", "548", "Lutheran Orthodoxy"],
              ["Georg Adam Struve", "539", "Law"],
              ["Hermann Conring", "510", "Political Theory"],
              ["Johannes Coccejus", "484", "Covenant Theology"],
              ["Georg Wolfgang Wedel", "476", "Medicine"],
              ["Johannes Hoornbeek", "460", "Reformed Theology"],
              ["Balthasar Meisner", "451", "Anthropology, Theology"],
              ["Juan Luis Vives", "446", "Humanism, Education"],
              ["Niccolò Tedeschi", "439", "Canon Law"],
              ["Christian Gueinz", "432", "Theology"],
              ["Jacobus Revius", "422", "Reformed Theology"],
              ["Samuel Maresius", "419", "Reformed Theology"],
              ["Werner Rolfinck", "408", "Medicine, Anatomy"],
              ["Christoph Besold", "405", "Law, Political Theory"],
              ["Konrad Samuel Schurzfleisch", "389", "History"],
            ].map(([author, works, field], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{author}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#9e4a3a', fontWeight: 600 }}>{works}</td>
                <td style={{ padding: '12px 8px', color: '#666' }}>{field}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <h2>Who Were These People?</h2>

      <h3 style={{ color: '#9e4a3a' }}>Johann Gerhard (1582-1637)</h3>
      <p>
        The most important Lutheran theologian after Luther and Melanchthon. His
        <em> Loci Theologici</em> (23 volumes) was the definitive systematic theology
        of Lutheran orthodoxy, used as a textbook for over a century. His devotional
        works were translated into many languages during his lifetime—but today, only
        fragments exist in English. 697 published works; perhaps a dozen partially translated.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Samuel Stryk (1640-1710)</h3>
      <p>
        One of the most influential jurists in German legal history. His <em>Usus modernus
        pandectarum</em> shaped how Roman law was applied in German courts and influenced
        legal education for generations. The &ldquo;usus modernus&rdquo; tradition he defined
        is still studied in legal history—but scholars must read him in Latin. 642 works;
        effectively zero English translations.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Hermann Conring (1606-1681)</h3>
      <p>
        A polymath who made major contributions to political theory, history, and medicine.
        His <em>De origine juris Germanici</em> founded the field of German legal history.
        He was one of the first to study politics empirically rather than purely philosophically.
        Leibniz called him the most learned man in Germany. 510 works; almost nothing in English.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Georg Wolfgang Wedel (1645-1721)</h3>
      <p>
        Professor of medicine at Jena who supervised hundreds of medical dissertations and
        wrote extensively on pharmacology, chemistry, and medical practice. His works
        document the state of medical knowledge at a crucial transitional period. 476 works;
        zero translations.
      </p>

      <h2>The German University System</h2>

      <p>
        A striking pattern in the data: most of these forgotten giants are German, and most
        wrote primarily for the university system. The &ldquo;works&rdquo; we&apos;re counting include:
      </p>

      <ul>
        <li><strong>Disputations</strong> — Formal academic debates that
        were published as pamphlets</li>
        <li><strong>Dissertations</strong> — Supervised theses, often
        published under the professor&apos;s name</li>
        <li><strong>Lecture schedules</strong> — Official academic
        announcements</li>
        <li><strong>Funeral orations</strong> — Formal eulogies for
        prominent figures</li>
      </ul>

      <p>
        This explains the huge numbers. But it doesn&apos;t diminish their importance. These
        disputations and dissertations <em>were</em> how knowledge was produced and transmitted
        in early modern Europe. They document intellectual debates that shaped theology, law,
        medicine, and philosophy.
      </p>

      <h2>What Are We Missing?</h2>

      <p>
        The untranslated works of these authors contain:
      </p>

      <ul>
        <li><strong>Lost debates</strong> — Theological controversies that
        defined confessional identities</li>
        <li><strong>Legal reasoning</strong> — How jurists adapted Roman
        law to early modern conditions</li>
        <li><strong>Medical knowledge</strong> — What doctors actually
        believed and practiced</li>
        <li><strong>Political theory</strong> — Ideas about sovereignty,
        natural law, and government</li>
        <li><strong>Educational methods</strong> — How universities
        actually functioned</li>
      </ul>

      <p>
        We have the famous names—Hobbes, Locke, Descartes. But they were part of a larger
        conversation conducted largely in Latin. We&apos;ve translated the tips of icebergs
        while the masses beneath remain submerged.
      </p>

      <h2>A Research Opportunity</h2>

      <p>
        These 181 authors represent a massive opportunity for scholarship:
      </p>

      <ul>
        <li>Together they published over <strong>50,000 works</strong></li>
        <li>Many are digitized but unreadable (no OCR, no transcription)</li>
        <li>Almost none have modern critical editions</li>
        <li>Translation would open entire fields of inquiry</li>
      </ul>

      <p>
        The question isn&apos;t whether these works matter. Scholars in relevant fields know they
        do. The question is whether we can make them accessible—and modern AI might finally
        make that possible.
      </p>
    </BlogLayout>
  );
}
