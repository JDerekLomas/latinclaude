import Link from "next/link";

const posts = [
  {
    slug: "rivers-of-esoteric-life",
    title: "Rivers of Esoteric Life: Mapping the Hermetic Tradition",
    date: "December 2024",
    excerpt: "Applying Forlong's 'Rivers of Life' methodology to trace how Hermetica, alchemy, Kabbalah, and Rosicrucianism flowed through Renaissance publishing. Draft for discussion.",
    tag: "Draft",
  },
  {
    slug: "why-latin-matters",
    title: "Why Latin Matters: 500,000 Unread Books",
    date: "December 2024",
    excerpt: "The Renaissance produced half a million Latin works. 97% have never been translated. What are we missing?",
    tag: "Mission",
  },
  {
    slug: "forgotten-authors",
    title: "The Forgotten Giants: Prolific Authors You've Never Heard Of",
    date: "December 2024",
    excerpt: "Jakob Martini wrote 836 works. Johann Gerhard wrote 697. You've never read a word they wrote—because almost none of it has been translated.",
    tag: "Research",
  },
  {
    slug: "renaissance-bestsellers",
    title: "Renaissance Bestsellers Nobody Reads",
    date: "December 2024",
    excerpt: "Some Latin books went through 100+ editions. They shaped European thought for centuries. Today, they're completely inaccessible.",
    tag: "Research",
  },
  {
    slug: "translation-gap",
    title: "The Translation Gap: 95% of Latin Literature is Locked Away",
    date: "December 2024",
    excerpt: "Only 416 Latin works ever appeared in Latin-English bilingual editions. The numbers reveal a staggering accessibility crisis.",
    tag: "Data",
  },
  {
    slug: "famous-humanists",
    title: "Even Ficino Isn't Fully Translated",
    date: "December 2024",
    excerpt: "You'd think the famous Renaissance humanists would be fully available. They're not. Ficino, Pico, Valla—vast bodies of work remain untranslated.",
    tag: "Research",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href="/" className="text-violet-400 hover:underline text-sm">
            ← Back to visualization
          </Link>
          <h1 className="text-4xl font-bold mt-4">Research Notes</h1>
          <p className="text-slate-400 mt-2">
            Exploring the hidden Latin heritage of the Renaissance
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded">
                    {post.tag}
                  </span>
                  <span className="text-slate-500 text-sm">{post.date}</span>
                </div>
                <h2 className="text-2xl font-semibold mb-2 hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-400">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          Data from the Universal Short Title Catalogue (USTC) •{" "}
          <a
            href="https://github.com/JDerekLomas/latinclaude"
            className="text-violet-400 hover:underline"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
