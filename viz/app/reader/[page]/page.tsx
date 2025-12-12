import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase-server";

async function fetchTextFile(url?: string | null) {
  if (!url) return "(no text uploaded yet)";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "(unable to fetch text)";
    return await res.text();
  } catch {
    return "(unable to fetch text)";
  }
}

export default async function ReaderPage({ params }: { params: { page: string } }) {
  const pageNumber = Number(params.page);
  if (Number.isNaN(pageNumber)) {
    return <div className="p-8">Invalid page number.</div>;
  }

  const supabase = createServerClient();
  const { data: pageRecord, error } = await supabase
    .from("digitizer_pages")
    .select("page_number, source_url, processed_url, ocr_url, translation_url")
    .eq("page_number", pageNumber)
    .single();

  if (error || !pageRecord) {
    return (
      <div className="p-8 text-sm text-red-700">
        Page {pageNumber} not found. Upload more pages via the digitizer pipeline.
      </div>
    );
  }

  const [ocrText, translationText] = await Promise.all([
    fetchTextFile(pageRecord.ocr_url),
    fetchTextFile(pageRecord.translation_url),
  ]);

  const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber + 1;

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#1c1410]">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#9b6c4a]">De Mysteriis Viewer</p>
            <h1 className="text-3xl font-['Cormorant_Garamond']">Page {pageNumber}</h1>
          </div>
          <div className="flex gap-3 text-sm">
            {prevPage ? (
              <Link className="rounded-full border border-[#c8b6a3] px-4 py-1" href={`/reader/${prevPage}`}>
                ← Page {prevPage}
              </Link>
            ) : (
              <span className="rounded-full border border-transparent px-4 py-1 text-[#b8a89a]">Beginning</span>
            )}
            <Link className="rounded-full border border-[#c8b6a3] px-4 py-1" href="/digitizer">
              Upload another
            </Link>
            <Link className="rounded-full border border-[#c8b6a3] px-4 py-1" href={`/reader/${nextPage}`}>
              Page {nextPage} →
            </Link>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)]">
          <section className="rounded-2xl border border-[#dfccbb] bg-white/90 p-4 shadow-sm">
            <h2 className="text-center font-['Cormorant_Garamond'] text-xl">Facsimile</h2>
            {pageRecord.processed_url ? (
              <div className="mt-4">
                <Image
                  src={pageRecord.processed_url}
                  alt={`Processed page ${pageNumber}`}
                  width={600}
                  height={900}
                  className="w-full rounded border border-[#d3c3b5]"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-[#6e5b50]">
                  <span>Preview JPEG</span>
                  {pageRecord.source_url ? (
                    <a
                      href={pageRecord.source_url}
                      className="rounded-full border border-[#caa891] px-3 py-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open high-res
                    </a>
                  ) : (
                    <span>No source PNG</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#7e6a5a]">No image uploaded yet.</p>
            )}
          </section>

          <section className="rounded-2xl border border-[#dfccbb] bg-white/90 p-4 shadow-sm">
            <h2 className="text-center font-['Cormorant_Garamond'] text-xl">Latin OCR</h2>
            <pre className="mt-4 h-[520px] overflow-auto whitespace-pre-wrap rounded bg-[#f9f5ef] p-3 text-sm leading-relaxed text-[#2f2119]">
              {ocrText}
            </pre>
          </section>

          <section className="rounded-2xl border border-[#dfccbb] bg-white/90 p-4 shadow-sm">
            <h2 className="text-center font-['Cormorant_Garamond'] text-xl">Translation</h2>
            <pre className="mt-4 h-[520px] overflow-auto whitespace-pre-wrap rounded bg-[#f9f5ef] p-3 text-sm leading-relaxed text-[#2f2119]">
              {translationText}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
