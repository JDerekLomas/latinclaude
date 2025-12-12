# Measuring Esoteric Latin Digitization: A Multi-Signal Matching Methodology

## Research Question

**Primary question:** What proportion of esoteric Latin works (1400-1700) from a specialized collection (Bibliotheca Philosophica Hermetica) are discoverable in a major open digital repository (Internet Archive)?

**Secondary questions:**
1. How does digitization coverage vary by century of publication?
2. What characteristics predict whether a work will be digitized?
3. How reliable are title-only matching approaches for historical texts?

## Scope: 1400-1700

We focus on the period 1400-1700 for several reasons:
- **Core Renaissance/early modern period**: This captures the height of Latin esoteric publishing
- **No copyright complications**: All works are public domain
- **Better metadata**: Earlier works more likely to have standardized bibliographic records
- **Historical significance**: The Scientific Revolution and Hermetic revival

## Why This Matters

The Bibliotheca Philosophica Hermetica (BPH) in Amsterdam holds 30,000+ works on Hermeticism, alchemy, Kabbalah, Rosicrucianism, and related esoteric traditions. Many of these works are rare and understudied. Understanding their digital availability helps:

- Prioritize digitization efforts
- Identify gaps in digital humanities infrastructure
- Quantify the "dark matter" of esoteric intellectual history

## Data Sources

### Source Collection: BPH Latin Works
- **Source:** Bibliotheca Philosophica Hermetica catalog (embassyofthefreemind.com)
- **Filtering:** Works identified as Latin via regex pattern matching on titles
- **Count:** 10,683 Latin works
- **Metadata:** Title, author, year, UBN (catalog number)
- **Known limitation:** Regex-based language detection has ~30% false positive rate (validated against ISTC for 15th century)

### Target Repository: Internet Archive Latin Collection
- **Source:** Internet Archive advanced search (language:Latin)
- **Count:** 222,407 works
- **Metadata:** Identifier, title, creator, year
- **Known limitation:** Language classification is inconsistent; many works mislabeled

### Ground Truth Validation: ISTC
- **Source:** Incunabula Short Title Catalogue (British Library)
- **Count:** 30,087 records, 20,955 confirmed Latin
- **Purpose:** Validate language detection accuracy for 15th-century works

## Methodology Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-SIGNAL MATCHING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BPH Work ──┬──> Title Embedding ──> Cosine Similarity         │
│             │                              │                    │
│             ├──> Author Extraction ──> Surname Match            │
│             │                              │                    │
│             └──> Publication Year ──> Year Tolerance           │
│                                              │                    │
│                           ┌──────────────────┘                   │
│                           ▼                                      │
│                   Signal Combination                             │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           ▼               ▼               ▼                     │
│     High Conf.       Med. Conf.      Unmatched                  │
│   (title+author    (title only      (no signal                  │
│     +year)          ≥0.85)          ≥0.75)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Stage 1: Title Embedding Matching

### Model Selection
- **Model:** `paraphrase-multilingual-MiniLM-L12-v2`
- **Rationale:** Multilingual support handles Latin/vernacular mixed titles; good performance on short texts
- **Dimension:** 384-dimensional embeddings
- **Normalization:** L2-normalized for cosine similarity via inner product

### Indexing
- **Method:** FAISS IndexFlatIP (exact nearest neighbor search)
- **Index size:** 222,407 IA works × 384 dimensions
- **Search:** Top-5 nearest neighbors per BPH work

### Thresholds
Based on manual sample review:

| Score Range | Observed Quality | Classification |
|-------------|------------------|----------------|
| ≥ 0.90 | High true positive rate | Confirmed match |
| 0.85-0.90 | Mixed (needs verification) | Probable match |
| 0.75-0.85 | High false positive rate | Candidate only |
| < 0.75 | Mostly unrelated | Rejected |

**Key finding:** Title-only matching at threshold 0.75 yields 65% match rate, but includes many false positives (topically related but different works).

## Stage 2: Author Signal

### Surname Extraction
```python
def extract_surname(name):
    # Remove dates: "Ficino, Marsilio (1433-1499)" → "Ficino, Marsilio"
    name = re.sub(r'\([^)]+\)', '', name)
    # Remove post-comma content: "Ficino, Marsilio" → "Ficino"
    name = re.sub(r',.*', '', name)
    # Return first capitalized word > 3 chars
    for word in name.split():
        if len(word) > 3 and word[0].isupper():
            return word.lower()
    return None
```

### Author Matching
- **Method:** Fuzzy string matching (rapidfuzz ratio)
- **Threshold:** ≥ 80% similarity
- **Handles:** Spelling variations, transliterations (Hermes/Trismegistus)

## Stage 3: Year Signal

### Year Tolerance
- **Tolerance:** ±30 years
- **Rationale:** Reprints, collected works editions, cataloging errors
- **Missing data:** Treated as "unknown" (neither confirms nor denies)

## Stage 4: Signal Combination

### Confidence Tiers

| Tier | Requirements | Interpretation |
|------|-------------|----------------|
| **High Confidence** | Title ≥ 0.85 + Author match + Year match | Very likely same work |
| **Medium-High** | Title ≥ 0.85 + Author match | Same author, similar title |
| **Medium** | Title ≥ 0.85 + Year match | Similar title, same era |
| **Low-Medium** | Title ≥ 0.85 only | Title match, unverified |
| **Unmatched** | Title < 0.75 or no confirming signals | Not found in IA |

### Results from Experiments

| Matching Method | Match Rate | Estimated Precision |
|-----------------|------------|---------------------|
| Fuzzy string (threshold 80) | 18.6% | ~70% |
| Title embedding (≥0.75) | 65.3% | ~40% |
| Multi-signal (title + author/year) | 14.0% | ~85% |

The multi-signal approach trades recall for precision: we find fewer matches but have higher confidence in them.

## Stage 5: Validation

### Stratified Random Sampling
For validation, sample from each confidence tier:
1. **n=50** from high confidence matches
2. **n=50** from medium confidence matches
3. **n=50** from unmatched (verify truly absent)

### Validation Criteria
For each sample:
1. Does the IA work contain the BPH work's text?
2. Is it the same edition or a different edition?
3. Is it a complete text or excerpt/anthology?

### Cross-Reference with ISTC
For 15th-century works, validate Latin classification:
- BPH works flagged as Latin: 55
- Confirmed in ISTC as Latin: 36 (65%)
- False positives (actually vernacular): ~35%

## Limitations and Caveats

### What We Measure vs. What We Want to Know

| What we measure | What we'd like to know | Gap |
|-----------------|------------------------|-----|
| Discoverability in IA | True digitization | Works may be digitized elsewhere |
| Title/metadata match | Text availability | IA may have incomplete scans |
| Latin detection (regex) | True language | 30% false positive rate |

### Known Biases

1. **Survivorship bias:** BPH catalog only includes works that survived and were collected
2. **Selection bias:** BPH specializes in esoteric works, not representative of all Latin printing
3. **Temporal bias:** IA digitization favors out-of-copyright works (pre-1929)
4. **Language detection bias:** Regex favors works with Latin-looking titles; misses Latin works with vernacular titles

### What This Method Cannot Tell Us

- Actual OCR quality or searchability of matched works
- Whether matched works are complete or fragmentary
- Translation availability
- Whether unmatched works are digitized elsewhere (HathiTrust, Google Books, national libraries)

## Reproducibility

### Code Repository
All scripts available at: `/Users/dereklomas/latinclaude/scripts/`
- `bph_ia_fuzzy_match.py` - Fuzzy string matching
- `bph_ia_embedding_match.py` - Semantic embedding matching

### Data Storage
- Supabase database: `ykhxaecbbxaaqlujuzde.supabase.co`
- Tables: `bph_works`, `ia_latin_texts`, `istc_works`
- Embedding cache: `data/embedding_cache/`

### Environment
- Python 3.11+
- Key dependencies: `sentence-transformers`, `faiss-cpu`, `rapidfuzz`, `supabase`

## Recommended Reporting

When citing these results:

> "Using multi-signal matching (semantic title similarity + author/year confirmation), we found that approximately **14%** of Latin works from the Bibliotheca Philosophica Hermetica have discoverable equivalents in the Internet Archive. This figure represents a lower bound on true digitization, as works may be available in other repositories. Title-only matching yields higher rates (65%) but with substantial false positives."

### What NOT to claim

- "86% of esoteric Latin works are undigitized" (we only checked one repository)
- "The Internet Archive has 14% coverage" (precision-recall tradeoff means true coverage is likely higher)
- "Only 14% of Latin literature is accessible" (BPH is not representative of all Latin publishing)

## Future Improvements

1. **Expand target repositories:** HathiTrust, Google Books, Europeana, national libraries
2. **Improve language detection:** Use ISTC/USTC cross-reference for authoritative labels
3. **Add edition matching:** Match specific editions, not just works
4. **OCR quality assessment:** Check if matched works are actually searchable
5. **Manual validation at scale:** Crowdsource verification of sample matches

## Human Validation Protocol

### Purpose
Ground truth validation through stratified random sampling to:
1. Validate Latin language detection accuracy
2. Assess match quality at different confidence tiers
3. Verify "unmatched" works are truly absent from IA

### Sample Generation
Script: `scripts/generate_review_samples.py`
Output: `data/human_review/*.csv`

### Validation Tasks

**1. Latin Validation (n=50)**
- Stratified by century (15th, 16th, 17th)
- For each work: Open BPH catalog URL, verify language
- Record: `is_latin` (Yes/No/Partial), `actual_language`, `notes`
- Expected outcome: Estimate false positive rate in Latin detection

**2. Match Validation (n=50 per tier)**
- Sample from each confidence tier
- For each pair: Verify BPH and IA are same work
- Record: `is_same_work`, `is_same_edition`, `notes`
- Expected outcome: Precision estimate per confidence tier

**3. Unmatched Verification (n=50)**
- Sample from works not matched by algorithm
- For each: Manually search IA with variations
- Record: `found_in_ia`, `ia_identifier`, `match_quality`
- Expected outcome: False negative (recall) estimate

### Analysis
After human review:
- Latin precision = (true Latin) / (flagged as Latin)
- Match precision per tier = (true matches) / (predicted matches)
- False negative rate = (manually found) / (total unmatched sampled)

## Appendix: Results Summary (1400-1700)

From multi-signal matching experiment:

| Category | Count | % of Total |
|----------|-------|------------|
| **Total BPH Latin works** | **2,531** | 100% |
| Matched (any signal) | 660 | 26.1% |
| - Title + Author + Year | 96 | 3.8% |
| - Title + Author | 46 | 1.8% |
| - Title + Year | 127 | 5.0% |
| - Title only (≥0.85) | 391 | 15.4% |
| Unmatched | 1,871 | 73.9% |

### By Century

| Century | Total | Matched | Rate |
|---------|-------|---------|------|
| 15th | 60 | 20 | 33.3% |
| 16th | 891 | 307 | 34.5% |
| 17th | 1,552 | 328 | 21.1% |

The higher rate in earlier centuries likely reflects:
- Better standardization in incunabula/early print catalogs
- More comprehensive digitization of early printed books
- Fewer works overall, higher priority for digitization
