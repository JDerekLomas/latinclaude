# Agent Instructions: Find Latin-to-English Translations

## Your Task
Search for English translations of Latin works from 1450-1700. Build a database of what's available.

## Search Strategy

### 1. Journal Article Translations

Search Google Scholar for these patterns:

```
"first English translation" Latin medieval
"first English translation" Latin Renaissance
"translated for the first time" Latin 15th century
"translated for the first time" Latin 16th century
"facing-page translation" Latin
"critical edition and translation" Latin
"Latin text with English translation"
site:jstor.org "translation" "Latin text"
site:muse.jhu.edu "translation" Latin medieval
```

For each result, extract:
- Latin author name
- Latin work title
- Translator name
- Journal/publication
- Year published
- DOI or URL

### 2. Dissertation Translations

Search for dissertations containing translations:

```
site:proquest.com dissertation "Latin text" "English translation"
site:ethos.bl.uk thesis Latin translation
"PhD dissertation" "edition and translation" Latin
"doctoral thesis" "first translation" Latin medieval
```

### 3. Anthology/Reader Translations

Many translations appear in anthologies:

```
"Medieval Latin reader" translation
"Renaissance Latin reader" translation
"anthology" "Latin texts" "English translation"
"sourcebook" Latin medieval translation
```

### 4. Specific Author Searches

For major untranslated authors from USTC, search:

```
"[Author Name]" "English translation"
"[Author Name]" translated English
"[Latin Work Title]" translation
```

Priority authors (high USTC counts, likely untranslated):
- Jacobus de Voragine (beyond Golden Legend)
- Desiderius Erasmus (beyond major works)
- Philipp Melanchthon
- Martin Luther (Latin works)
- Jean Calvin (Latin works)
- Robert Bellarmine
- Francisco Suárez
- Justus Lipsius

### 5. Publisher Backlist Searches

Search publisher websites directly:

```
site:brill.com Latin translation
site:brepols.net Latin translation English
site:degruyter.com Latin medieval translation
site:oxfordscholarship.com Latin translation
site:cambridge.org Latin text translation
```

## Output Format

For each translation found, record:

```json
{
  "latin_author": "Petrarch",
  "latin_title": "De remediis utriusque fortunae",
  "english_title": "Remedies for Fortune Fair and Foul",
  "translator": "Conrad H. Rawski",
  "year": 1991,
  "publisher": "Indiana University Press",
  "source_type": "monograph",
  "access": "commercial",
  "url": "https://...",
  "notes": "5 volumes, complete translation",
  "partial": false
}
```

## Quality Checks

For each translation found:
1. Is it a FULL translation or just excerpts?
2. Is it a scholarly translation or a loose paraphrase?
3. Is it currently in print or only in libraries?
4. Is it open access or paywalled?

## Deduplication

Same Latin work may have multiple translations. Record all, but note:
- Which is most recent?
- Which is most complete?
- Which is most accessible?

## Progress Tracking

After each search session, summarize:
- Number of new translations found
- Source types (journal, dissertation, monograph)
- Time periods covered
- Notable gaps discovered

## Known Major Gaps

These important authors/works likely have LIMITED translations:
- University dissertations (thousands in USTC)
- Funeral orations (20,000+ in USTC)
- Legal commentaries (70,000+ in USTC)
- Medical texts beyond Galen/Hippocrates
- Jesuit annual letters and relations
- Protestant polemical literature
- Municipal chronicles and histories
