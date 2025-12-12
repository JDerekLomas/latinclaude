# Second Renaissance: Unlocking Latin Literature (1450-1700)

Exploring the vast corpus of Latin literature from the Renaissance and early modern period—over 500,000 works, 97% of which have never been translated into English. Building tools to translate and make these texts accessible.

## Live Site

**[secondrenaissance.vercel.app](https://secondrenaissance.vercel.app)**

## The Problem

The Renaissance produced an explosion of intellectual output in Latin: theology, philosophy, medicine, law, science, poetry. The Universal Short Title Catalogue (USTC) records over 500,000 Latin works printed between 1450 and 1700.

- **~3%** have English translations
- **~18%** are digitized
- **~8%** have searchable OCR text

Most of this heritage is locked away, accessible only to the small number of scholars who can read early modern Latin.

## Data Sources

### USTC (Universal Short Title Catalogue)
- 1.6 million total records
- 533,000 Latin works extracted
- Bibliographic data: authors, titles, places, printers, dates, classifications

### BPH (Bibliotheca Philosophica Hermetica / Ritman Library)
- 28,000 records focused on Western esotericism
- 2,700+ works digitized
- Core holdings: Hermetica, alchemy, Kabbalah, Rosicrucianism, mysticism

## Features

### Catalogs
- **Hermetic Library (BPH)**: 28,000 esoteric works with Internet Archive links
- **USTC Data Explorer**: 500,000 Latin works from 1450-1700

### Tools
- **Translation Dashboard**: Upload PDFs or select from IA catalog for AI-assisted OCR and translation
- **Digitizer**: Single-page Latin OCR and translation
- **Validation Interface**: Review and validate matched records

### Research
- Blog posts exploring the translation gap, forgotten authors, and Renaissance bestsellers
- Geographic and temporal visualizations of Latin publishing

## Project Structure

```
secondrenaissance/
├── data/                   # Data files (large files in .gitignore)
├── docs/                   # Methodology documentation
├── scripts/                # Data processing & matching (Python)
│   ├── translate_book.py   # Book translation pipeline
│   ├── bph_ia_*.py         # BPH-IA matching algorithms
│   └── supabase_*.sql      # Database schemas
├── viz/                    # Next.js webapp
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── bph/            # Hermetic catalog browser
│   │   ├── translate/      # Translation dashboard
│   │   ├── digitizer/      # Single-page digitizer
│   │   └── blog/           # Research posts
│   └── components/
└── .claude/
    └── commands/           # Latin translation CLI commands
```

## Research Questions Explored

1. **The Translation Gap**: Only 416 Latin works ever appeared in Latin-English bilingual editions
2. **Forgotten Authors**: 181 prolific authors (100+ works each) with almost no translations
3. **Renaissance Bestsellers**: Works with 100+ editions that remain untranslated
4. **Famous Humanists**: Even Ficino, Pico, and Valla aren't fully translated
5. **Rivers of Esoteric Life**: Mapping how Hermetic traditions flowed through publishing

## Blog Posts

- [Why Latin Matters: 500,000 Unread Books](/blog/why-latin-matters)
- [The Forgotten Giants](/blog/forgotten-authors)
- [Renaissance Bestsellers Nobody Reads](/blog/renaissance-bestsellers)
- [The Translation Gap](/blog/translation-gap)
- [Even Ficino Isn't Fully Translated](/blog/famous-humanists)
- [Rivers of Esoteric Life](/blog/rivers-of-esoteric-life) (Draft)

## Data Not in Repository

Large data files are excluded from git (see `.gitignore`):

- `data/raw/ustc/ustc_editions_july_2025.csv` (685 MB, 1.6M records)
- `data/raw/ustc/ustc_latin_editions.csv` (225 MB, 533K records)
- `data/raw/bph/bph_catalog.csv` (12 MB, 28K records)

Contact for access to raw data exports.

## Tech Stack

- **Frontend**: Next.js 14, Recharts, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Data processing**: Python, pandas
- **AI/ML**: OpenAI GPT-4o, Anthropic Claude for OCR and translation
- **Hosting**: Vercel

## Future Work

- [ ] Interactive timeline of esoteric publishing ("Rivers of Life")
- [ ] Animated map of European printing centers
- [ ] Background worker for batch translation processing
- [ ] Expert review workflow for translation refinement
- [x] AI-assisted translation pipeline (in progress)
- [x] Cross-reference with Internet Archive digitization

## Acknowledgments

- [Universal Short Title Catalogue (USTC)](https://www.ustc.ac.uk/)
- [Embassy of the Free Mind / Bibliotheca Philosophica Hermetica](https://embassyofthefreemind.com/)
- [I Tatti Renaissance Library](https://www.hup.harvard.edu/collection.php?cpk=1272)

## License

Data visualizations and analysis: MIT License

Source data subject to respective catalogue terms of use.
