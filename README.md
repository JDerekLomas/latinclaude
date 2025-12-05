# The Hidden Renaissance: Latin Works in Print (1450-1700)

Exploring the vast corpus of Latin literature from the Renaissance and early modern period—over 500,000 works, 97% of which have never been translated into English.

## Live Site

**[latinclaude.vercel.app](https://latinclaude.vercel.app)**

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

## Project Structure

```
latinclaude/
├── data/
│   ├── raw/
│   │   ├── ustc/           # USTC exports (not in git - too large)
│   │   └── bph/            # BPH catalog (not in git)
│   ├── viz_data.json       # Aggregated data for visualization
│   └── bph_rivers_of_life.json
├── viz/                    # Next.js visualization app
│   ├── app/
│   │   ├── page.tsx        # Main dashboard
│   │   └── blog/           # Research notes
│   └── public/
│       └── viz_data.json
├── docs/                   # Methodology documentation
└── scripts/                # Data processing (Python)
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

- **Data processing**: Python, pandas
- **Visualization**: Next.js 14, Recharts, Tailwind CSS
- **Hosting**: Vercel

## Future Work

- [ ] Interactive timeline of esoteric publishing ("Rivers of Life")
- [ ] Animated map of European printing centers
- [ ] Timeline of major publishers
- [ ] Timeline of major authors
- [ ] Cross-reference with Internet Archive/Google Books digitization
- [ ] AI-assisted translation pipeline exploration

## Acknowledgments

- [Universal Short Title Catalogue (USTC)](https://www.ustc.ac.uk/)
- [Embassy of the Free Mind / Bibliotheca Philosophica Hermetica](https://embassyofthefreemind.com/)
- [I Tatti Renaissance Library](https://www.hup.harvard.edu/collection.php?cpk=1272)

## License

Data visualizations and analysis: MIT License

Source data subject to respective catalogue terms of use.
