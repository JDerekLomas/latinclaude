import Link from "next/link";

export default function MappingTranslations() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-8 py-6">
          <Link href="/blog" className="text-violet-400 hover:underline text-sm">
            ← Back to Research Notes
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-8">
          <span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded">
            Methods
          </span>
          <span className="text-slate-500 text-sm ml-3">December 2024</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Mapping the Translation Landscape: A Research Diary
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-slate-300 mb-8">
            How do you count something that&apos;s never been counted? Today we built a comprehensive
            database of Latin-to-English translations—and discovered how much we don&apos;t know.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Problem</h2>

          <p className="text-slate-300 mb-4">
            We wanted to answer a simple question: <em>How much Latin has been translated into English?</em>
          </p>

          <p className="text-slate-300 mb-4">
            It turns out nobody knows. There&apos;s no master list of Latin translations. Publishers
            don&apos;t track them. Libraries catalog by title, not by source language. Academics work
            in silos. The result: a vast body of translation work exists, but it&apos;s scattered across
            dozens of series, hundreds of publishers, and centuries of scholarship.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Phase 1: The Major Series</h2>

          <p className="text-slate-300 mb-4">
            We started with the obvious: major translation series from academic publishers.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Commercial Translation Series</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2">Series</th>
                  <th className="text-right py-2">Volumes</th>
                  <th className="text-left py-2 pl-4">Publisher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="py-2">Loeb Classical Library</td>
                  <td className="text-right font-mono text-cyan-400">537-558</td>
                  <td className="pl-4 text-slate-400">Harvard</td>
                </tr>
                <tr>
                  <td className="py-2">Aris & Phillips Classical Texts</td>
                  <td className="text-right font-mono text-cyan-400">170+</td>
                  <td className="pl-4 text-slate-400">Liverpool</td>
                </tr>
                <tr>
                  <td className="py-2">Fathers of the Church</td>
                  <td className="text-right font-mono text-cyan-400">147-148</td>
                  <td className="pl-4 text-slate-400">CUA Press</td>
                </tr>
                <tr>
                  <td className="py-2">Oxford Medieval Texts</td>
                  <td className="text-right font-mono text-cyan-400">~103</td>
                  <td className="pl-4 text-slate-400">OUP</td>
                </tr>
                <tr>
                  <td className="py-2">I Tatti Renaissance Library</td>
                  <td className="text-right font-mono text-cyan-400">101</td>
                  <td className="pl-4 text-slate-400">Harvard</td>
                </tr>
                <tr>
                  <td className="py-2">Dumbarton Oaks Medieval Library</td>
                  <td className="text-right font-mono text-cyan-400">91 (34 Latin)</td>
                  <td className="pl-4 text-slate-400">Harvard</td>
                </tr>
                <tr>
                  <td className="py-2">Translated Texts for Historians</td>
                  <td className="text-right font-mono text-cyan-400">86+</td>
                  <td className="pl-4 text-slate-400">Liverpool</td>
                </tr>
                <tr>
                  <td className="py-2">Collected Works of Erasmus</td>
                  <td className="text-right font-mono text-cyan-400">86+</td>
                  <td className="pl-4 text-slate-400">Toronto</td>
                </tr>
                <tr>
                  <td className="py-2">Ancient Christian Writers</td>
                  <td className="text-right font-mono text-cyan-400">76</td>
                  <td className="pl-4 text-slate-400">Paulist</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-300 mb-4">
            Finding: roughly 1,400-1,500 volumes across major commercial series. But volume counts
            are misleading—one Loeb volume might contain a single short work or a multi-book epic.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Phase 2: Open Access Resources</h2>

          <p className="text-slate-300 mb-4">
            The real surprise: how much is freely available online.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Open Access Collections</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Loebolus</span>
                  <span className="font-mono">277 PDFs</span>
                </div>
                <p className="text-slate-500 text-sm">Public domain Loeb volumes (pre-1930)</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Internet Archive - Loeb</span>
                  <span className="font-mono">545 volumes</span>
                </div>
                <p className="text-slate-500 text-sm">Complete Loeb collection, 12.3 GB</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Internet Archive - Fathers</span>
                  <span className="font-mono">147 volumes</span>
                </div>
                <p className="text-slate-500 text-sm">Complete Fathers of the Church series</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Philological Museum</span>
                  <span className="font-mono">~200 texts + 79,760 bibliography items</span>
                </div>
                <p className="text-slate-500 text-sm">Dana Sutton&apos;s Neo-Latin translations</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Global Medieval Sourcebook</span>
                  <span className="font-mono">~200 texts</span>
                </div>
                <p className="text-slate-500 text-sm">Stanford&apos;s multilingual medieval collection</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">Perseus Digital Library</span>
                  <span className="font-mono">50+ texts</span>
                </div>
                <p className="text-slate-500 text-sm">Tufts classics collection</p>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">17centurymaths.com</span>
                  <span className="font-mono">30+ works</span>
                </div>
                <p className="text-slate-500 text-sm">Ian Bruce&apos;s scientific Latin translations</p>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            Dana Sutton&apos;s Philological Museum was a revelation: a single scholar has been quietly
            translating Neo-Latin texts for decades, with an analytic bibliography of nearly
            80,000 items.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Phase 3: The Citation Problem</h2>

          <p className="text-slate-300 mb-4">
            Early in our research, we ran into a problem: most statistics about Latin literature
            were estimates without sources. &ldquo;500,000 Latin works&rdquo; appeared everywhere, but where
            did it come from?
          </p>

          <p className="text-slate-300 mb-4">
            We rebuilt our database with strict citation requirements:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Verified Statistics</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-slate-300">Library of Latin Texts (Brepols)</span>
                <div className="text-right">
                  <span className="font-mono text-cyan-400">12,149 works / 167M words</span>
                  <p className="text-slate-500 text-xs">Source: Brepolis.net, 2024</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-300">Medieval manuscripts produced</span>
                <div className="text-right">
                  <span className="font-mono text-cyan-400">11,000,000</span>
                  <p className="text-slate-500 text-xs">Source: Buringh (2011)</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-300">Medieval manuscripts surviving</span>
                <div className="text-right">
                  <span className="font-mono text-cyan-400">~2,900,000</span>
                  <p className="text-slate-500 text-xs">Source: Buringh (2011)</p>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-300">Loeb volumes in public domain</span>
                <div className="text-right">
                  <span className="font-mono text-cyan-400">429 of 558 (76%)</span>
                  <p className="text-slate-500 text-xs">Source: Wikipedia</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Phase 4: Direct Database Analysis</h2>

          <p className="text-slate-300 mb-4">
            The breakthrough came when we got access to the USTC database itself—not just the
            web interface, but the raw data. 1.4 GB of Access database containing 1,628,578 editions.
          </p>

          <p className="text-slate-300 mb-4">
            Using <code className="text-violet-400">mdb-tools</code> and Python, we extracted:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">USTC Database Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total editions</span>
                <span className="font-mono text-cyan-400">1,628,578</span>
              </div>
              <div className="flex justify-between">
                <span>Latin editions</span>
                <span className="font-mono text-violet-400">503,486 (30.9%)</span>
              </div>
              <div className="flex justify-between">
                <span>Peak decade for Latin</span>
                <span className="font-mono">1660s (37,292 editions)</span>
              </div>
              <div className="flex justify-between">
                <span>When German overtook Latin</span>
                <span className="font-mono">1670s</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            We also extracted Latin editions by classification:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Latin Editions by Subject</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>University Publications</span>
                <span className="font-mono text-cyan-400">147,859</span>
              </div>
              <div className="flex justify-between">
                <span>Religious</span>
                <span className="font-mono text-cyan-400">118,250</span>
              </div>
              <div className="flex justify-between">
                <span>Jurisprudence</span>
                <span className="font-mono text-cyan-400">35,243</span>
              </div>
              <div className="flex justify-between">
                <span>Classical Authors</span>
                <span className="font-mono text-cyan-400">17,221</span>
              </div>
              <div className="flex justify-between">
                <span>Educational Books</span>
                <span className="font-mono text-cyan-400">14,775</span>
              </div>
              <div className="flex justify-between">
                <span>Poetry</span>
                <span className="font-mono text-cyan-400">14,022</span>
              </div>
              <div className="flex justify-between">
                <span>Medical Texts</span>
                <span className="font-mono text-cyan-400">13,357</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            <strong className="text-white">Key finding:</strong> University publications and religious
            texts account for 52.8% of all Latin editions. These are the least translated categories.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Built</h2>

          <p className="text-slate-300 mb-4">
            The result is a comprehensive database with:
          </p>

          <ul className="text-slate-300 space-y-2 mb-6">
            <li>• Verified statistics from 45+ sources</li>
            <li>• Complete language breakdown of 1.6M editions</li>
            <li>• Decade-by-decade data from 1450 to 1700</li>
            <li>• Subject classification of all Latin works</li>
            <li>• Inventory of all major translation series</li>
            <li>• Catalog of open-access resources</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What We Still Don&apos;t Know</h2>

          <p className="text-slate-300 mb-4">
            The research revealed as many gaps as facts:
          </p>

          <ul className="text-slate-300 space-y-2 mb-6">
            <li>
              <strong className="text-white">Loeb Latin/Greek split:</strong> Harvard doesn&apos;t publish
              the exact breakdown. The commonly cited ~50/50 is an estimate.
            </li>
            <li>
              <strong className="text-white">Total translations ever made:</strong> No comprehensive
              count exists. Our estimate of 8,000-15,000 works is rough.
            </li>
            <li>
              <strong className="text-white">Dissertation translations:</strong> Thousands of Latin
              works have been translated in PhD dissertations. Most are never published.
            </li>
            <li>
              <strong className="text-white">Quality assessment:</strong> We can count translations
              but not evaluate them. Some Victorian translations are unreliable.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Takeaway</h2>

          <p className="text-slate-300 mb-4">
            The gap between what exists and what&apos;s accessible is larger than we expected.
            Half a million Latin editions in the USTC alone. Perhaps 2% translated. The infrastructure
            to fix this—AI translation, digital archives, open access publishing—now exists.
            What&apos;s missing is the systematic effort to use it.
          </p>

          <p className="text-slate-300 mb-4">
            The data is now published. The question is what to do with it.
          </p>

          <div className="bg-slate-900/50 border border-violet-500/30 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-3">Resources Created Today</h3>
            <ul className="text-slate-300 space-y-2 text-sm">
              <li>• <code className="text-violet-400">latin_translations_cited.json</code> — All statistics with source citations</li>
              <li>• <code className="text-violet-400">LATIN_TRANSLATIONS_CITED.md</code> — Human-readable report with methodology</li>
              <li>• <code className="text-violet-400">ustc_language_chart.html</code> — Interactive visualization of language data</li>
              <li>• USTC database analysis scripts</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between">
          <Link
            href="/blog/methodology"
            className="text-violet-400 hover:underline"
          >
            ← Methodology
          </Link>
          <Link
            href="/blog"
            className="text-violet-400 hover:underline"
          >
            All Posts →
          </Link>
        </div>
      </article>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          <a href="https://github.com/JDerekLomas/latinclaude" className="text-violet-400 hover:underline">
            View project on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
