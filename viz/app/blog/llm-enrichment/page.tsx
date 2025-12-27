import BlogLayout from "../BlogLayout";
import { generateBlogMetadata, generateArticleJsonLd } from "@/lib/blogMetadata";

const postMeta = {
  title: "Teaching AI to Read 630,000 Renaissance Book Titles",
  description: "We used Claude and Gemini to enrich the entire USTC catalogue with translations, subject tags, and religious affiliations—creating a navigable map of early modern print culture.",
  slug: "llm-enrichment",
  date: "2024-12-27",
};

export const metadata = generateBlogMetadata(postMeta);
const jsonLd = generateArticleJsonLd(postMeta);

export default function LLMEnrichment() {
  return (
    <BlogLayout
      title="Teaching AI to Read 630,000 Renaissance Book Titles"
      tag="Research"
      slug="llm-enrichment"
      prevPost={{ href: "/blog/renaissance-bestsellers", title: "Renaissance Bestsellers" }}
      nextPost={{ href: "/blog/methodology", title: "Methodology" }}
      jsonLd={jsonLd}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        The Universal Short Title Catalogue contains 1.6 million records of books printed
        between 1450 and 1700. But the metadata is sparse: just a title, author, year, and
        place. We used large language models to enrich 630,000 of these records with
        English translations, subject classifications, and religious affiliations—making
        the intellectual landscape of the Renaissance finally navigable.
      </p>

      <h2>The Problem: Titles Without Context</h2>

      <p>
        Here&apos;s a typical USTC record:
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        fontFamily: 'monospace',
        fontSize: '14px',
      }}>
        <div><strong>Title:</strong> Disputatio de potestate papae in rebus temporalibus</div>
        <div><strong>Author:</strong> Bellarmine, Roberto</div>
        <div><strong>Year:</strong> 1610</div>
        <div><strong>Place:</strong> Rome</div>
        <div><strong>Language:</strong> Latin</div>
      </figure>

      <p>
        If you read Latin, you know this is a treatise on papal authority over temporal
        matters—a key text in the Counter-Reformation debate over church and state. But
        the USTC doesn&apos;t tell you that. It doesn&apos;t tell you it&apos;s Catholic, that it&apos;s
        responding to Protestant arguments, or that it belongs to the genre of political
        theology.
      </p>

      <p>
        Multiply this by 1.6 million records. Scholars who want to study, say, Protestant
        responses to Catholic natural philosophy in the 1590s have no way to filter the
        catalogue. There&apos;s no subject search, no religious affiliation field, no way to
        find commentaries on Aristotle versus original treatises.
      </p>

      <h2>The Solution: LLM Enrichment at Scale</h2>

      <p>
        We ran every intellectual title through Claude Haiku and Gemini Flash in parallel,
        asking each model to extract structured metadata:
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
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Field</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["english_title", "Translation of the title to English"],
              ["detected_language", "Actual language (Latin, French, German, etc.)"],
              ["work_type", "original, commentary, translation, edition, sermon, treatise..."],
              ["original_author", "For commentaries: who is being commented on (Aristotle, Galen...)"],
              ["subject_tags", "1-3 specific tags (astronomy, medicine, theology...)"],
              ["religious_tradition", "Catholic, Protestant, Lutheran, Calvinist, secular..."],
              ["classical_source", "If based on a Greek/Roman work"],
            ].map(([field, desc], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#9e4a3a' }}>{field}</td>
                <td style={{ padding: '12px 8px', color: '#666' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <p>
        The same Bellarmine record now becomes:
      </p>

      <figure style={{
        background: '#1a1612',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e0e0e0',
        overflow: 'auto',
      }}>
        <pre style={{ margin: 0 }}>{`{
  "english_title": "Disputation on the Power of the Pope in Temporal Affairs",
  "detected_language": "Latin",
  "work_type": "treatise",
  "original_author": null,
  "subject_tags": ["political theology", "papal authority", "church-state relations"],
  "religious_tradition": "Catholic",
  "classical_source": null
}`}</pre>
      </figure>

      <p>
        Now you can search. You can filter. You can ask questions like: &ldquo;Show me all
        Protestant treatises on natural philosophy published in Germany between 1550 and
        1600.&rdquo; The catalogue becomes a research tool instead of just an inventory.
      </p>

      <h2>The Numbers</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
          {[
            ["630,862", "Records enriched"],
            ["249,120", "Latin titles"],
            ["240,327", "Catholic works"],
            ["33,571", "Commentaries"],
          ].map(([value, label]) => (
            <div key={label}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#9e4a3a', fontFamily: 'monospace' }}>{value}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </figure>

      <p>
        We focused on &ldquo;intellectual&rdquo; categories—Religious, Jurisprudence, Philosophy,
        Science, Classical Authors, Medical Texts, History—and excluded ephemera like
        newspapers, funeral orations, and wedding pamphlets. English-language titles were
        also excluded since they don&apos;t need translation.
      </p>

      <h2>Explore the Data</h2>

      <p>
        The visualization below shows the complete enriched dataset. Hover over elements
        to see details; click the legend to filter by language.
      </p>

      <figure style={{
        margin: '32px 0',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e0d8c8',
      }}>
        <iframe
          src="/ustc_enrichment_explorer.html"
          style={{
            width: '100%',
            height: '900px',
            border: 'none',
          }}
          title="USTC Enrichment Explorer"
        />
      </figure>

      <h2>What We Found</h2>

      <h3 style={{ color: '#9e4a3a' }}>Latin Dominance, Then Decline</h3>
      <p>
        Latin represents 40% of all enriched titles (249,120 works). But the timeline
        shows its gradual displacement by vernacular languages. French, German, and
        Spanish all grow steadily from the mid-1500s, while Latin&apos;s share shrinks.
        By 1700, Latin is no longer the majority language of intellectual publishing
        in most of Europe.
      </p>

      <h3 style={{ color: '#9e4a3a' }}>The Catholic-Secular Split</h3>
      <p>
        38% of works are explicitly Catholic; 34% are secular (no religious affiliation).
        Protestant traditions combined (Protestant, Lutheran, Calvinist, Anglican)
        account for about 15%. This reflects both the geography of printing (Italy,
        France, and Spain were Catholic) and the nature of what got printed (much
        scholarly work was religiously neutral).
      </p>

      <h3 style={{ color: '#9e4a3a' }}>Commentary Culture</h3>
      <p>
        33,571 works are classified as commentaries—works that explain or expand upon
        another author&apos;s text. The most commented-upon authors: Aristotle (philosophy,
        natural science), Galen (medicine), Justinian (law), and Augustine (theology).
        This commentary culture is largely invisible without enrichment; titles like
        &ldquo;In libros Physicorum&rdquo; don&apos;t tell you it&apos;s an Aristotle commentary unless
        you already know.
      </p>

      <h2>3D Semantic Maps</h2>

      <p>
        We also embedded book titles using sentence transformers and visualized them in
        3D space using UMAP dimensionality reduction. But we added a twist: <strong>time
        as the vertical axis</strong>.
      </p>

      <p>
        In these visualizations, each point is a book. Books with similar titles cluster
        together horizontally (semantic similarity), but they&apos;re stacked vertically by
        publication year. This means you can literally see the <em>lifespan of ideas</em>:
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
          <li><strong>Vertical columns</strong> represent works that were reprinted over decades—a column of points rising through time shows a text that stayed in print for 50, 100, or 200 years.</li>
          <li><strong>Isolated points</strong> represent works that were printed once and never again—ideas that didn&apos;t catch on, or specialized texts with limited audiences.</li>
          <li><strong>Semantic drift</strong> becomes visible when clusters shift horizontally over time—the same subject matter gets discussed differently as intellectual frameworks evolve.</li>
        </ul>
      </figure>

      <p>
        Aristotelian natural philosophy, for example, forms a dense vertical column from
        1450 to 1650—constant reprinting of commentaries on the <em>Physics</em> and
        <em>De Anima</em>. But around 1650, the column thins dramatically as Cartesian
        and Newtonian frameworks displace scholastic natural philosophy.
      </p>

      <figure style={{
        margin: '32px 0',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e0d8c8',
      }}>
        <iframe
          src="/ustc_3d_timeline.html"
          style={{
            width: '100%',
            height: '700px',
            border: 'none',
          }}
          title="USTC 3D Timeline"
        />
        <figcaption style={{
          padding: '12px 16px',
          background: '#f5f0e8',
          fontSize: '13px',
          color: '#666',
          borderTop: '1px solid #e0d8c8',
        }}>
          3D semantic map with time as vertical axis. Rotate to explore; hover for details.
          Dense vertical columns indicate works reprinted across decades.
        </figcaption>
      </figure>

      <h2>Technical Details</h2>

      <p>
        The enrichment pipeline ran in parallel across Claude Haiku and Gemini Flash:
      </p>

      <figure style={{
        background: '#1a1612',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e0e0e0',
        overflow: 'auto',
      }}>
        <pre style={{ margin: 0 }}>{`# 4 Claude workers + 4 Gemini workers, processing 10k titles per batch
PYTHONUNBUFFERED=1 python scripts/enrich_safe.py 10000 4 4

# Each batch takes ~8 minutes
# Saves incrementally after every 10 records (no data loss on crash)
# Syncs to Supabase every 100 records`}</pre>
      </figure>

      <p>
        The system processed approximately 10,000 titles per batch, with each batch
        taking 8-10 minutes. Incremental saves after every 10 records meant that even
        if the process crashed (which it did, multiple times), we never lost more than
        a few seconds of work.
      </p>

      <p>
        Total processing time for 630,000 records: approximately 63 batches over several
        days, running in the background while we worked on other things.
      </p>

      <h2>What&apos;s Next</h2>

      <p>
        The enriched data is now available via API. Other researchers can query it
        directly:
      </p>

      <figure style={{
        background: '#1a1612',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e0e0e0',
        overflow: 'auto',
      }}>
        <pre style={{ margin: 0 }}>{`# Search for Protestant astronomy texts
curl "https://ykhxaecbbxaaqlujuzde.supabase.co/rest/v1/ustc_enrichments\\
  ?religious_tradition=eq.Protestant\\
  &subject_tags=cs.[\"astronomy\"]" \\
  -H "apikey: [key]"

# Get all commentaries on Aristotle
curl ".../ustc_enrichments?work_type=eq.commentary&original_author=ilike.*Aristotle*"`}</pre>
      </figure>

      <p>
        We&apos;re also working on cross-referencing with digitization databases to identify
        which of these 630,000 works are actually available online. Because knowing what
        exists is only the first step—the next is making it readable.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid #e0d8c8', margin: '48px 0 24px' }} />

      <h3 style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#888', marginBottom: '16px' }}>Notes & Sources</h3>

      <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px', lineHeight: 1.8 }}>
        <li>
          USTC data from <a href="https://ustc.ac.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#9e4a3a' }}>Universal Short Title Catalogue</a>.
          Total catalogue: 1,628,578 records. Enriched subset: 630,862 records (intellectual
          categories, non-English).
        </li>
        <li>
          Enrichment models: Claude 3 Haiku (Anthropic) and Gemini 2.0 Flash (Google).
          Both models showed strong performance on Latin, French, German, Spanish, and Italian
          titles. Hebrew and Greek titles had higher error rates.
        </li>
        <li>
          3D embeddings generated using <code>all-MiniLM-L6-v2</code> sentence transformer,
          reduced to 3 dimensions via UMAP. Time axis added as third dimension for
          temporal visualization.
        </li>
        <li>
          All data available via Supabase REST API. Contact for access credentials.
        </li>
      </ol>
    </BlogLayout>
  );
}
