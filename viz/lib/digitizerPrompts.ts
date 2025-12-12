export type DigitizerStage = {
  id: string;
  title: string;
  description: string;
  defaultValue: string;
};

export const digitizerStages: DigitizerStage[] = [
  {
    id: "imageProcessing",
    title: "Image Rendering Script",
    description:
      "Command or script snippet that converts the uploaded PDF into archival PNGs and enhanced JPEGs. Users can adjust DPI, ranges, or output paths before launching the job.",
    defaultValue: `# Example CLI invocation\npython scripts/de_mysteriis_processing.py \\\n  --pdf data/marsilio_ficino_de_mysteriis/original_pdf/De_mysteriis_1570_Tornaesium_original_text.pdf \\\n  --base-dir data/marsilio_ficino_de_mysteriis \\\n  --start 1 --end 10 \\\n  --dpi 350 \\\n  --run-notes "Initial batch" \\\n  --prompt-file data/marsilio_ficino_de_mysteriis/project_prompt.md \\\n  --metadata-json data/marsilio_ficino_de_mysteriis/page_metadata.jsonl`,
  },
  {
    id: "ocrPrompt",
    title: "OCR Prompt",
    description:
      "Instructions for the LLM that transcribes each processed JPEG into Markdown, including [[notes]] for layout, uncertainties, and page numbers.",
    defaultValue: `You are transcribing a Renaissance Latin facsimile.\n- Input: processed_images/page_####_processed.jpg and the prior page's translation.\n- Output: ocr_text/page_####_ocr.md\n- Begin with [[notes: describe damage, layout, ink, anything odd]].\n- Include [[page number: ####]] near the top.\n- Preserve capitalization and spacing; use Markdown headings, centered lines, and italics so the page resembles the source.\n- Mark any uncertain characters or alternate readings inline with [[notes]].\n- Expand abbreviations only when certain; otherwise leave as-is or mention the ambiguity.`,
  },
  {
    id: "translationPrompt",
    title: "Translation Prompt",
    description:
      "Guidelines for translating the OCR into layperson-friendly English while mirroring the source structure and annotating choices.",
    defaultValue: `You are translating the freshly transcribed Latin text (page_####_ocr.md) into accessible English.\n- Use clear Markdown mirroring the source layout (headings, centered mottoe, line breaks).\n- Start with [[notes: mention prior-page context, tricky phrases, historical references, or multiple readings]].\n- Keep [[notes]] inline wherever extra explanation or alternate translation helps a general reader.\n- Style: warm museum label—explain references rather than leaving jargon unexplained.\n- Always mention the page number and any running themes from preceding pages.`,
  },
  {
    id: "summaryPrompt",
    title: "Plain-Language Summary Prompt",
    description:
      "Template used to produce a 3–5 sentence summary for each page, saved to summaries/page_####_summary.md.",
    defaultValue: `Summarize the contents of the page for a general, non-specialist reader.\n- 3 to 5 sentences, optionally bullet points.\n- Mention key people, ideas, and why the page matters to modern audiences.\n- Highlight continuity with the previous page in [[notes]] at the top.\n- File: summaries/page_####_summary.md.`,
  },
];
