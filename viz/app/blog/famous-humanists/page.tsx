import Link from "next/link";

export default function FamousHumanists() {
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
            Research
          </span>
          <span className="text-slate-500 text-sm ml-3">December 2024</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Even Ficino Isn&apos;t Fully Translated
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-slate-300 mb-8">
            You&apos;d think the famous Renaissance humanists would be fully available in English.
            They&apos;re not. Even the names you recognize—Ficino, Pico, Valla—have vast bodies of
            work that have never been translated.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Illusion of Accessibility</h2>

          <p className="text-slate-300 mb-4">
            When we think of Renaissance philosophy, certain names come to mind: Marsilio Ficino,
            Giovanni Pico della Mirandola, Lorenzo Valla, Angelo Poliziano. These are the &ldquo;canonical&rdquo;
            figures. They appear in every textbook. They&apos;re the humanists we <em>have</em> translated—right?
          </p>

          <p className="text-slate-300 mb-4">
            Not quite. We&apos;ve translated their <em>greatest hits</em>. The famous works, the quotable
            passages, the texts that made it into anthologies. But their full output? Mostly unavailable.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Marsilio Ficino (45 editions in USTC)</h2>

          <p className="text-slate-300 mb-4">
            Ficino is the founder of Renaissance Neoplatonism. He translated Plato into Latin for
            the first time since antiquity. He wrote the <em>Platonic Theology</em>, a massive work
            on the immortality of the soul. He was the center of the Florentine Academy.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">What IS translated:</h3>
            <ul className="text-slate-300 space-y-1 mb-4">
              <li>• Platonic Theology (complete, 6 volumes, Harvard I Tatti)</li>
              <li>• Commentary on Plato&apos;s Symposium</li>
              <li>• Three Books on Life</li>
              <li>• Selected letters (partial)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-red-400">What is NOT translated:</h3>
            <ul className="text-slate-300 space-y-1">
              <li>• Most of his commentaries on Plato&apos;s dialogues</li>
              <li>• Commentary on Plotinus (his other major project)</li>
              <li>• Medical and astrological works</li>
              <li>• The bulk of his correspondence (over 1,000 letters)</li>
              <li>• Many shorter philosophical treatises</li>
            </ul>
          </div>

          <p className="text-slate-300 mb-4">
            Ficino&apos;s influence was enormous—he shaped how Europe understood Plato for centuries.
            But to actually <em>study</em> Ficino in depth, you still need Latin.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Lorenzo Valla (255 editions in USTC)</h2>

          <p className="text-slate-300 mb-4">
            Valla is famous for two things: proving the Donation of Constantine was a forgery,
            and writing <em>De Elegantia Linguae Latinae</em>—the most influential Latin style
            guide of the Renaissance. The first has been translated. The second has not.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">What IS translated:</h3>
            <ul className="text-slate-300 space-y-1 mb-4">
              <li>• On the Donation of Constantine</li>
              <li>• De Voluptate / On Pleasure (his philosophical dialogue)</li>
              <li>• On Free Will</li>
              <li>• Some letters and shorter works</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-red-400">What is NOT translated:</h3>
            <ul className="text-slate-300 space-y-1">
              <li>• <strong>De Elegantia Linguae Latinae</strong> — 255 editions, no complete English translation</li>
              <li>• Dialectical Disputations (Repastinatio Dialectice)</li>
              <li>• Most of his polemical works and invectives</li>
              <li>• Historical works (Gesta Ferdinandi Regis)</li>
            </ul>
          </div>

          <p className="text-slate-300 mb-4">
            The <em>Elegantiae</em> went through <strong>255 editions</strong>. It was one of the most
            widely-read books of the Renaissance—a bestseller that shaped Latin style for two
            centuries. And there&apos;s no complete English translation.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Giovanni Pico della Mirandola (72 editions)</h2>

          <p className="text-slate-300 mb-4">
            Everyone knows the &ldquo;Oration on the Dignity of Man&rdquo;—it&apos;s in every Renaissance anthology.
            But Pico wrote far more than that one speech.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-3 text-emerald-400">What IS translated:</h3>
            <ul className="text-slate-300 space-y-1 mb-4">
              <li>• Oration on the Dignity of Man</li>
              <li>• Heptaplus (commentary on Genesis)</li>
              <li>• On Being and the One</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 text-red-400">What is NOT translated:</h3>
            <ul className="text-slate-300 space-y-1">
              <li>• The 900 Theses (what the Oration was supposed to introduce!)</li>
              <li>• Disputationes adversus astrologiam</li>
              <li>• Most of his philosophical correspondence</li>
              <li>• Commentary on Benivieni&apos;s love poetry</li>
            </ul>
          </div>

          <p className="text-slate-300 mb-4">
            The famous Oration was written as a preface to 900 theses Pico wanted to debate
            publicly. We&apos;ve translated the preface. The actual theses—the substance of what
            he wanted to argue—remain mostly inaccessible in English.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The Pattern</h2>

          <p className="text-slate-300 mb-4">
            The same pattern repeats across Renaissance humanism:
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden my-8">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left p-3">Author</th>
                  <th className="text-right p-3">Editions</th>
                  <th className="text-left p-3">Translation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="p-3">Justus Lipsius</td>
                  <td className="text-right p-3 font-mono">558</td>
                  <td className="p-3 text-amber-400">~5% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Lorenzo Valla</td>
                  <td className="text-right p-3 font-mono">255</td>
                  <td className="p-3 text-amber-400">~10% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Girolamo Cardano</td>
                  <td className="text-right p-3 font-mono">109</td>
                  <td className="p-3 text-amber-400">~15% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Angelo Poliziano</td>
                  <td className="text-right p-3 font-mono">105</td>
                  <td className="p-3 text-red-400">~5% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Leonardo Bruni</td>
                  <td className="text-right p-3 font-mono">79</td>
                  <td className="p-3 text-amber-400">~20% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Pico della Mirandola</td>
                  <td className="text-right p-3 font-mono">72</td>
                  <td className="p-3 text-amber-400">~15% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Giacomo Zabarella</td>
                  <td className="text-right p-3 font-mono">67</td>
                  <td className="p-3 text-red-400">&lt;5% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Giovanni Pontano</td>
                  <td className="text-right p-3 font-mono">47</td>
                  <td className="p-3 text-red-400">&lt;5% translated</td>
                </tr>
                <tr>
                  <td className="p-3">Marsilio Ficino</td>
                  <td className="text-right p-3 font-mono">45</td>
                  <td className="p-3 text-amber-400">~25% translated</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold mt-12 mb-4">Why This Matters</h2>

          <p className="text-slate-300 mb-4">
            If even <em>Ficino</em> isn&apos;t fully translated—one of the most important philosophers
            of the Renaissance, someone with a dedicated scholarly following—what hope is there for
            the thousands of less famous writers?
          </p>

          <p className="text-slate-300 mb-4">
            Our understanding of Renaissance thought is based on:
          </p>

          <ul className="text-slate-300 space-y-2 mb-6">
            <li>• A handful of famous works from a handful of famous authors</li>
            <li>• Selected excerpts in anthologies</li>
            <li>• Secondary scholarship (often based on the same limited sources)</li>
          </ul>

          <p className="text-slate-300 mb-4">
            We&apos;ve built an entire field—Renaissance Studies—on what amounts to a greatest-hits
            compilation. The deep albums, the B-sides, the full discography? Still in Latin.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">The I Tatti Renaissance Library</h2>

          <p className="text-slate-300 mb-4">
            There is good news: Harvard&apos;s I Tatti Renaissance Library has been steadily translating
            neo-Latin texts since 2001. They&apos;ve published over 90 volumes of Latin-English facing
            pages—Ficino, Bruni, Pontano, Poliziano, and many others.
          </p>

          <p className="text-slate-300 mb-4">
            But 90 volumes over 23 years, covering perhaps a few hundred works total, against a
            corpus of 500,000+ Latin texts from this period? The math doesn&apos;t work. At current
            rates, it would take tens of thousands of years to translate everything.
          </p>

          <p className="text-slate-300 mb-4">
            The I Tatti library is heroic work. But it&apos;s a teaspoon against an ocean.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">What Would Full Access Look Like?</h2>

          <p className="text-slate-300 mb-4">
            Imagine if you could:
          </p>

          <ul className="text-slate-300 space-y-2 mb-6">
            <li>• Read Ficino&apos;s complete correspondence—1,000+ letters documenting Renaissance intellectual networks</li>
            <li>• Access Valla&apos;s <em>Elegantiae</em>—the style guide that shaped how Europe wrote Latin</li>
            <li>• Study Zabarella&apos;s logical works—hugely influential on early modern philosophy</li>
            <li>• Explore Lipsius&apos;s philological scholarship—558 editions worth of humanist learning</li>
          </ul>

          <p className="text-slate-300 mb-4">
            That&apos;s not a hypothetical future. Those texts exist. They&apos;re sitting in libraries
            and digital archives right now. What&apos;s missing is the bridge—the translation that
            makes them accessible.
          </p>

          <p className="text-slate-300 mb-4">
            The question is whether we wait another few centuries for traditional scholarship to
            catch up, or whether we find new ways to open these texts to readers.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between">
          <Link
            href="/blog/translation-gap"
            className="text-violet-400 hover:underline"
          >
            ← The Translation Gap
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
