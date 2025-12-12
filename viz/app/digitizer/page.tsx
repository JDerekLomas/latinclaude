"use client";

import { FormEvent, useMemo, useState } from "react";
import { digitizerStages } from "@/lib/digitizerPrompts";

type JobResponse = {
  jobId: string;
  originalName: string;
  storedPath: string;
  scriptPath: string;
  notes: string;
  prompts: Record<string, string>;
  message: string;
};

export default function DigitizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scriptPath, setScriptPath] = useState("scripts/de_mysteriis_processing.py");
  const [notes, setNotes] = useState("Uploaded from Second Renaissance digitizer portal.");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);

  const [prompts, setPrompts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    digitizerStages.forEach((stage) => {
      initial[stage.id] = stage.defaultValue;
    });
    return initial;
  });

  const promptOrder = useMemo(() => digitizerStages.map((stage) => stage.id), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Select a PDF to begin.");
      return;
    }
    setError(null);
    setJob(null);
    setStatus("submitting");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("prompts", JSON.stringify(prompts));
      formData.append("scriptPath", scriptPath);
      formData.append("notes", notes);

      const response = await fetch("/api/digitizer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Request failed");
      }

      const payload = (await response.json()) as JobResponse;
      setJob(payload);
      setStatus("success");
    } catch (apiError) {
      console.error(apiError);
      setError(apiError instanceof Error ? apiError.message : "Unable to start job.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1b140f]">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] text-[#8a6a4a]">Digitization Workbench</p>
          <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl">Upload, transcribe, and translate a Renaissance PDF</h1>
          <p className="mt-4 text-base text-[#5f4b3c]">
            Configure every stage of the pipeline—rendering, OCR, translation, and summaries—before sending the job to
            the processing worker. API keys stay in Vercel environment variables.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d9c8b4] bg-white/90 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="text-sm font-semibold text-[#4d3a2b]">PDF Upload</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  setFile(nextFile ?? null);
                }}
                className="mt-2 w-full cursor-pointer rounded border border-dashed border-[#c1b09c] bg-[#faf7f2] px-4 py-6 text-sm text-[#6c5b4a]"
              />
              {file && (
                <p className="mt-2 text-xs text-[#6c5b4a]">
                  Selected: <span className="font-semibold">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[#4d3a2b]">Python script path / command</label>
                <textarea
                  value={scriptPath}
                  onChange={(event) => setScriptPath(event.target.value)}
                  className="mt-2 h-32 w-full rounded border border-[#d9c8b4] bg-[#fefdfb] p-3 text-sm text-[#1b140f]"
                />
                <p className="mt-1 text-xs text-[#8c7966]">
                  The processing worker should execute this command once the upload finishes.
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4d3a2b]">Run notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 h-32 w-full rounded border border-[#d9c8b4] bg-[#fefdfb] p-3 text-sm text-[#1b140f]"
                />
                <p className="mt-1 text-xs text-[#8c7966]">
                  Stored with the run log so future users know why this batch was processed.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="font-['Cormorant_Garamond'] text-2xl">Edit prompts and scripts between stages</h2>
              {promptOrder.map((stageId) => {
                const stage = digitizerStages.find((item) => item.id === stageId)!;
                return (
                  <div key={stage.id} className="rounded-xl border border-[#e1d4c3] bg-[#fefcf9] p-4 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#4d3a2b]">{stage.title}</h3>
                        <p className="text-sm text-[#6c5b4a]">{stage.description}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.3em] text-[#b18a63]">Editable</span>
                    </div>
                    <textarea
                      value={prompts[stage.id]}
                      onChange={(event) =>
                        setPrompts((prev) => ({
                          ...prev,
                          [stage.id]: event.target.value,
                        }))
                      }
                      className="mt-4 min-h-[140px] w-full rounded border border-[#d3c1ad] bg-white p-3 text-sm text-[#1b140f]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[#6c5b4a]">
                When you submit, the PDF is saved server-side and the prompts are forwarded to the processing worker via
                the <code>DIGITIZER_API_KEY</code>-protected endpoint.
              </p>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full bg-[#9e4a3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7c382c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Uploading…" : "Start Digitization"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 rounded border border-red-200 bg-red-50/60 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {job && (
            <div className="mt-6 space-y-3 rounded border border-[#c9b59d] bg-[#fffefd] p-4 text-sm text-[#3f3024]">
              <p className="font-semibold">Job started: {job.jobId}</p>
              <ul className="list-disc pl-5">
                <li>Original file: {job.originalName}</li>
                <li>Stored path: <code>{job.storedPath}</code></li>
                <li>Script/command: <code>{job.scriptPath}</code></li>
              </ul>
              <p className="text-xs text-[#7a6754]">{job.message}</p>
              <details className="rounded bg-[#f9f5ef] p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#4d3a2b]">Prompts summary</summary>
                <div className="mt-2 space-y-4">
                  {Object.entries(job.prompts).map(([stageId, value]) => (
                    <div key={stageId}>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#b18a63]">{stageId}</p>
                      <pre className="mt-1 whitespace-pre-wrap rounded bg-white p-3 text-xs text-[#1b140f]">{value}</pre>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
