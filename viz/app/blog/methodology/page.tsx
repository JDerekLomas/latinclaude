import Link from "next/link";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link href="/" className="text-violet-400 hover:underline text-sm">
            &larr; Back to visualization
          </Link>
          <h1 className="text-4xl font-bold mt-4">Methodology</h1>
          <p className="text-slate-400 mt-2">
            How we estimated digitization and translation rates
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-12">
        <article className="prose prose-invert prose-lg max-w-none">

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Sources</h2>

            <h3 className="text-xl font-medium text-violet-400 mt-6 mb-3">Universal Short Title Catalogue (USTC)</h3>
            <p className="text-slate-300 mb-4">
              The base dataset comes from the{" "}
              <a href="https://www.ustc.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                Universal Short Title Catalogue
              </a>
              , maintained by the University of St Andrews. The USTC is the most comprehensive database of early European printing (pre-1701), containing bibliographic records for over 2 million editions.
            </p>
            <p className="text-slate-300 mb-4">
              We queried the USTC for all records where the primary language field contains &ldquo;Latin&rdquo; or &ldquo;lat&rdquo;, yielding <strong className="text-white">521,206 edition records</strong> for the period 1450&ndash;1700.
            </p>
            <p className="text-slate-400 text-sm">
              Note: &ldquo;Edition&rdquo; counts unique printings, not copies. A popular work reprinted 50 times counts as 50 editions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Digitization Estimates</h2>

            <p className="text-slate-300 mb-4">
              The &ldquo;Accessibility Gap&rdquo; funnel on our homepage uses estimates derived from multiple sources:
            </p>

            <h3 className="text-xl font-medium text-violet-400 mt-6 mb-3">Digitized Scans (~18%)</h3>
            <p className="text-slate-300 mb-4">
              We estimate that approximately 18% of early printed Latin works have been digitized (scanned images available online). This estimate is based on:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>
                <strong className="text-white">Google Books</strong>: The 2010 estimate of 15 million digitized books included substantial pre-1800 holdings from partner libraries. However, Latin incunabula and early modern works are a small fraction of this total.
              </li>
              <li>
                <strong className="text-white">HathiTrust</strong>: Contains{" "}
                <a href="https://www.hathitrust.org/statistics_visualizations" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  17+ million digitized volumes
                </a>
                , with significant overlap with Google Books. Their &ldquo;pre-1700&rdquo; holdings are substantial but not language-tagged.
              </li>
              <li>
                <strong className="text-white">Internet Archive</strong>: Hosts millions of scanned books including major early modern collections. Their 2019 announcement claimed 3.8 million scanned books, with continued growth since.
              </li>
              <li>
                <strong className="text-white">EEBO/ECCO</strong>: ProQuest&apos;s Early English Books Online and Eighteenth Century Collections Online have extensive coverage but focus on English-language materials.
              </li>
              <li>
                <strong className="text-white">Europeana</strong>: Aggregates digitized content from European cultural institutions, including substantial Latin holdings from national libraries.
              </li>
            </ul>
            <p className="text-slate-400 text-sm mb-4">
              Cross-referencing USTC identifiers with HathiTrust and Internet Archive APIs would provide more precise figures. Our 18% estimate is conservative, acknowledging that many digitized works exist in institutional repositories not fully indexed by major aggregators.
            </p>

            <h3 className="text-xl font-medium text-violet-400 mt-6 mb-3">OCR/Searchable (~8%)</h3>
            <p className="text-slate-300 mb-4">
              We estimate that only about 8% of Latin works have been processed with OCR (Optical Character Recognition) or manual transcription that makes the text searchable and machine-readable.
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>
                <strong className="text-white">OCR accuracy challenges</strong>: Early printed books use blackletter fonts, abbreviations, and ligatures that modern OCR struggles with. Google&apos;s OCR performs poorly on pre-1800 texts without specialized training.
              </li>
              <li>
                <strong className="text-white">Latin-specific issues</strong>: OCR models trained primarily on modern English text have higher error rates on Latin morphology, particularly declined endings and medieval abbreviations.
              </li>
              <li>
                <strong className="text-white">Transcription projects</strong>: Projects like{" "}
                <a href="https://www.digitale-sammlungen.de/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  MDZ (M&uuml;nchener DigitalisierungsZentrum)
                </a>
                {" "}and{" "}
                <a href="https://www.e-codices.unifr.ch/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  e-codices
                </a>
                {" "}provide high-quality transcriptions but cover only a fraction of the total corpus.
              </li>
            </ul>
            <p className="text-slate-400 text-sm mb-4">
              The 8% figure assumes roughly half of digitized works have usable OCR or transcriptions. This may be optimistic given the known quality issues with automated processing of early printed books.
            </p>

            <h3 className="text-xl font-medium text-violet-400 mt-6 mb-3">English Translations (~3%)</h3>
            <p className="text-slate-300 mb-4">
              We estimate approximately 3% of Renaissance Latin works have published English translations. This is based on:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
              <li>
                <strong className="text-white">Loeb Classical Library</strong>: The premier Latin-English series contains ~550 volumes, heavily weighted toward classical authors (Cicero, Virgil, etc.) rather than Renaissance works.
              </li>
              <li>
                <strong className="text-white">I Tatti Renaissance Library</strong>: Harvard&apos;s dedicated Renaissance Latin series has published ~70 volumes since 2001&mdash;excellent work but a tiny fraction of the corpus.
              </li>
              <li>
                <strong className="text-white">Other academic translations</strong>: University presses and scholarly journals have published translations of major humanists (Erasmus, Petrarch, More), but most secondary authors remain untranslated.
              </li>
              <li>
                <strong className="text-white">Historical translations</strong>: Some Renaissance Latin works were translated into English contemporaneously (16th&ndash;18th centuries), but these translations are themselves often rare or archaic.
              </li>
            </ul>
            <p className="text-slate-400 text-sm mb-4">
              The 3% figure may overstate coverage, as translation efforts concentrate on the same canonical authors. Many thousands of Latin medical treatises, legal commentaries, theological disputations, and local histories have never been translated into any modern language.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Known Limitations</h2>

            <ul className="list-disc list-inside text-slate-300 space-y-3">
              <li>
                <strong className="text-white">No systematic cross-reference</strong>: We have not programmatically matched USTC records against HathiTrust, Google Books, or Internet Archive holdings. Such matching would require resolving variant titles, author names, and publication details.
              </li>
              <li>
                <strong className="text-white">Estimates are approximate</strong>: The percentages are order-of-magnitude estimates based on published statistics from major digitization projects, not precise counts.
              </li>
              <li>
                <strong className="text-white">Moving target</strong>: Digitization efforts are ongoing. Large-scale projects continue to scan and process early printed books, so these figures represent a snapshot that may already be outdated.
              </li>
              <li>
                <strong className="text-white">Access vs. existence</strong>: Some digitized works are behind paywalls (JSTOR, ProQuest) or restricted to institutional access, complicating &ldquo;accessibility&rdquo; assessments.
              </li>
              <li>
                <strong className="text-white">Translation quality varies</strong>: Counting &ldquo;translated&rdquo; works doesn&apos;t assess translation quality. Many older translations use archaic English or take interpretive liberties.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Further Research</h2>

            <p className="text-slate-300 mb-4">
              A more rigorous assessment would involve:
            </p>
            <ol className="list-decimal list-inside text-slate-300 space-y-2">
              <li>Sampling USTC records and systematically checking availability in major digital libraries</li>
              <li>Using USTC&apos;s own &ldquo;digital copy&rdquo; links (where available) as ground truth</li>
              <li>Analyzing HathiTrust&apos;s language metadata for pre-1700 holdings</li>
              <li>Building a database of known English translations of Latin Renaissance works</li>
              <li>Evaluating OCR quality on sample texts using character error rate metrics</li>
            </ol>
            <p className="text-slate-300 mt-4">
              If you have expertise in this area or access to relevant datasets, we welcome contributions via our{" "}
              <a href="https://github.com/JDerekLomas/latinclaude" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                GitHub repository
              </a>.
            </p>
          </section>

          <section className="mb-12 border-t border-slate-800 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">References</h2>

            <ul className="text-slate-400 space-y-3 text-sm">
              <li>
                Universal Short Title Catalogue.{" "}
                <a href="https://www.ustc.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  https://www.ustc.ac.uk/
                </a>
              </li>
              <li>
                HathiTrust Digital Library Statistics.{" "}
                <a href="https://www.hathitrust.org/statistics_visualizations" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  https://www.hathitrust.org/statistics_visualizations
                </a>
              </li>
              <li>
                Internet Archive.{" "}
                <a href="https://archive.org/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  https://archive.org/
                </a>
              </li>
              <li>
                I Tatti Renaissance Library, Harvard University Press.{" "}
                <a href="https://www.hup.harvard.edu/collection.php?cpk=1260" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  https://www.hup.harvard.edu/collection.php?cpk=1260
                </a>
              </li>
              <li>
                Loeb Classical Library.{" "}
                <a href="https://www.loebclassics.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  https://www.loebclassics.com/
                </a>
              </li>
              <li>
                Hill, M.J. (2019). &ldquo;Quantifying the Impact of Dirty OCR on Historical Text Analysis.&rdquo;{" "}
                <em>Digital Scholarship in the Humanities</em>, 34(4).
              </li>
            </ul>
          </section>

        </article>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/blog" className="text-violet-400 hover:underline">
            &larr; Back to all articles
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          Data from{" "}
          <a href="https://www.ustc.ac.uk/" className="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">
            USTC
          </a>
        </p>
      </footer>
    </div>
  );
}
