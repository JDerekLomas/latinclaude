import Link from "next/link";

export default function DeathOfLatin() {
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
            Data
          </span>
          <span className="text-slate-500 text-sm ml-3">December 2024</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          The Death of Latin? What 1.6 Million Books Tell Us
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-slate-300 mb-8">
            Ask most people when Latin died and you&apos;ll get a vague answer: &ldquo;the Renaissance&rdquo;
            or &ldquo;when vernacular literature took off.&rdquo; But thanks to 1.6 million books in the
            Universal Short Title Catalogue, we can pinpoint the answer precisely.
          </p>

          <p className="text-2xl font-semibold text-violet-400 mb-8">
            German overtook Latin in the 1670s.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Data</h2>

          <p className="text-slate-300 mb-4">
            The USTC, maintained by the University of St Andrews, catalogs every known book printed
            in Europe during the first 250 years of printing. We analyzed the complete database
            (1,628,578 editions) by language and decade. Here&apos;s what emerged:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Language Distribution (1450-1700)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#8B0000'}}></span>
                  Latin
                </span>
                <span className="font-mono text-cyan-400">503,486 (30.9%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#1E3A5F'}}></span>
                  German
                </span>
                <span className="font-mono text-cyan-400">340,480 (20.9%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#2E5A88'}}></span>
                  French
                </span>
                <span className="font-mono text-cyan-400">241,569 (14.8%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#4A7FB0'}}></span>
                  English
                </span>
                <span className="font-mono text-cyan-400">164,363 (10.1%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#F4A460'}}></span>
                  Dutch
                </span>
                <span className="font-mono text-cyan-400">114,540 (7.0%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#228B22'}}></span>
                  Italian
                </span>
                <span className="font-mono text-cyan-400">113,282 (7.0%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{backgroundColor: '#DAA520'}}></span>
                  Spanish
                </span>
                <span className="font-mono text-cyan-400">97,700 (6.0%)</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            Latin wasn&apos;t just important—it was <em>dominant</em>. Nearly a third of everything
            printed in early modern Europe was in Latin.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Rise and Fall</h2>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-slate-200">The Early Days (1450s-1470s)</h3>

          <p className="text-slate-300 mb-4">
            In the first decades of printing, Latin was king. When Gutenberg printed his Bible,
            when the first presses spread across Europe, the market was overwhelmingly Latin.
            In the 1470s, Latin accounted for <strong className="text-white">79%</strong> of all editions.
          </p>

          <p className="text-slate-300 mb-4">
            Why? The audience for books was small: clergy, scholars, lawyers. These were people
            who read Latin as a matter of course. The infrastructure of learning—universities,
            monasteries, courts—ran on Latin.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-slate-200">The Reformation Spike (1520s)</h3>

          <p className="text-slate-300 mb-4">
            Then came Luther.
          </p>

          <p className="text-slate-300 mb-4">
            The 1520s saw an explosion of German-language printing. German editions jumped from
            1,870 in the 1510s to <strong className="text-white">8,343</strong> in the 1520s—a
            346% increase. For one decade, German nearly matched Latin in output.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">The Reformation Effect</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1510s German editions:</span>
                <span className="font-mono">1,870</span>
              </div>
              <div className="flex justify-between">
                <span>1520s German editions:</span>
                <span className="font-mono text-amber-400">8,343</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Increase:</span>
                <span className="font-mono">+346%</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            This was the pamphlet war of the Reformation: vernacular polemics, translated Bibles,
            popular religious tracts. For the first time, printing reached beyond the educated elite.
          </p>

          <p className="text-slate-300 mb-4">
            But Latin recovered. The 1530s saw German drop back while Latin held steady.
            The scholarly infrastructure remained Latin.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-slate-200">The Long Plateau (1550s-1660s)</h3>

          <p className="text-slate-300 mb-4">
            For over a century, Latin maintained its position. The numbers kept growing:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1550s:</span>
                <span className="font-mono">15,357 Latin editions</span>
              </div>
              <div className="flex justify-between">
                <span>1600s:</span>
                <span className="font-mono">30,939 Latin editions</span>
              </div>
              <div className="flex justify-between text-violet-400">
                <span>1660s (peak):</span>
                <span className="font-mono">37,292 Latin editions</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            This was the golden age of Neo-Latin: scientific treatises, humanist scholarship,
            international correspondence, university disputations. Newton&apos;s <em>Principia</em> (1687)
            was in Latin. So were Spinoza&apos;s <em>Ethics</em> (1677), Leibniz&apos;s philosophical works,
            and virtually all academic publications.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-3 text-slate-200">The Tipping Point (1670s)</h3>

          <p className="text-slate-300 mb-4">
            Then, almost suddenly, the lines crossed.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">The Crossover</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2">Decade</th>
                  <th className="text-right py-2">Latin</th>
                  <th className="text-right py-2">German</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">1660s</td>
                  <td className="text-right font-mono text-violet-400">37,292</td>
                  <td className="text-right font-mono">32,716</td>
                </tr>
                <tr className="bg-slate-800/50">
                  <td className="py-2 font-semibold">1670s</td>
                  <td className="text-right font-mono">36,483</td>
                  <td className="text-right font-mono text-emerald-400">41,446</td>
                </tr>
                <tr>
                  <td className="py-2">1680s</td>
                  <td className="text-right font-mono">33,325</td>
                  <td className="text-right font-mono text-emerald-400">45,893</td>
                </tr>
                <tr>
                  <td className="py-2">1690s</td>
                  <td className="text-right font-mono">33,090</td>
                  <td className="text-right font-mono text-emerald-400">49,233</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-300 mb-4">
            German didn&apos;t just overtake Latin—it accelerated while Latin declined. By the 1690s,
            German output was 49% higher than Latin.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What Happened?</h2>

          <p className="text-slate-300 mb-4">
            Several factors converged in the late 17th century:
          </p>

          <ul className="text-slate-300 space-y-4 mb-6">
            <li>
              <strong className="text-white">The rise of national academies.</strong> The Royal Society (1660),
              the Académie des Sciences (1666), and similar institutions began publishing in vernacular
              languages. Science, once Latin&apos;s stronghold, started switching.
            </li>
            <li>
              <strong className="text-white">Growing literacy.</strong> Education expanded beyond Latin-trained
              elites. A new reading public wanted books in their own languages.
            </li>
            <li>
              <strong className="text-white">Philosophical shift.</strong> Thinkers like Descartes and Locke
              deliberately chose vernaculars to reach wider audiences. The idea that serious thought
              required Latin was fading.
            </li>
            <li>
              <strong className="text-white">German institutional strength.</strong> The Holy Roman Empire&apos;s
              fragmented political structure paradoxically created a unified literary market. German
              became the common language of a dispersed but culturally connected region.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The English Exception</h2>

          <p className="text-slate-300 mb-4">
            One striking pattern: English printing exploded in the 1640s.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>1630s English editions:</span>
                <span className="font-mono">6,767</span>
              </div>
              <div className="flex justify-between">
                <span>1640s English editions:</span>
                <span className="font-mono text-amber-400">24,112</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Increase:</span>
                <span className="font-mono">+256%</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-4">
            That&apos;s the English Civil War and Interregnum. Pamphlets, newsbooks, political tracts,
            religious controversy. England&apos;s revolution was fought as much in print as on battlefields.
          </p>

          <p className="text-slate-300 mb-4">
            The 1640s spike in English (24,112 editions) briefly made it the second-most-printed
            language in Europe, surpassing German (20,521) and approaching Latin (30,143).
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What This Means for Latin Today</h2>

          <p className="text-slate-300 mb-4">
            The USTC data reveals something important: <strong className="text-white">Latin didn&apos;t die
            in 1700</strong>. It was still producing 33,000+ editions per decade at the end of the
            17th century—more than at any point before 1600.
          </p>

          <p className="text-slate-300 mb-4">
            Latin&apos;s &ldquo;death&rdquo; was relative, not absolute. It was overtaken, not abandoned. And the
            corpus it left behind is staggering.
          </p>

          <p className="text-slate-300 mb-4">
            Of those 503,486 Latin editions in the USTC, how many have been translated into English?
          </p>

          <p className="text-2xl font-semibold text-red-400 my-8">
            Less than 2%.
          </p>

          <p className="text-slate-300 mb-4">
            The university publications (147,859 editions), the religious texts (118,250), the legal
            commentaries (35,243), the medical treatises (13,357)—the vast majority remain accessible
            only to those who can read Latin.
          </p>

          <p className="text-slate-300 mb-4">
            We tend to think of Latin literature as a solved problem: Cicero, Virgil, Augustine,
            the &ldquo;classics.&rdquo; But the USTC reveals a different picture. The real Latin corpus
            isn&apos;t ancient—it&apos;s early modern. And it&apos;s largely untranslated.
          </p>

          <div className="bg-slate-900/50 border border-violet-500/30 rounded-lg p-6 my-8">
            <p className="text-slate-300 italic">
              Want to explore the data yourself? View the{" "}
              <Link href="/ustc-language-chart.html" className="text-violet-400 hover:underline">
                interactive visualization
              </Link>{" "}
              showing language distribution across all 25 decades.
            </p>
          </div>

          <p className="text-slate-400 text-sm mt-8">
            <strong>Source:</strong> Universal Short Title Catalogue, University of St Andrews.
            Direct analysis of USTC Editions July 2025.accdb database export.{" "}
            <a href="https://ustc.ac.uk" className="text-violet-400 hover:underline">ustc.ac.uk</a>
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between">
          <Link
            href="/blog/mapping-translations"
            className="text-violet-400 hover:underline"
          >
            ← Mapping Translations
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
