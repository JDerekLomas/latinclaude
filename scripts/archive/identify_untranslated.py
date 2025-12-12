#!/usr/bin/env python3
"""
Identify untranslated Latin works from our massive dataset
"""

import pandas as pd
import re
from datetime import datetime

def identify_untranslated_works():
    """Create a prioritized list of untranslated works"""

    print("🔍 IDENTIFYING UNTRANSLATED LATIN WORKS")
    print("=" * 50)

    # Load our massive dataset
    df = pd.read_csv('data/massive_latin_collection_20251119_091153.csv')
    print(f"📚 Loaded {len(df):,} Latin books")

    def extract_year(year_str):
        if pd.isna(year_str) or year_str == '':
            return None
        year_match = re.search(r'(\d{4})', str(year_str))
        return int(year_match.group(1)) if year_match else None

    df['clean_year'] = df['year'].apply(extract_year)
    df = df.dropna(subset=['clean_year'])

    # STRATEGY 1: DEFINITELY UNTRANSLATED WORKS
    print("\n🎯 STRATEGY 1: DEFINITELY UNTRANSLATED")

    # University diplomas, legal documents, administrative records
    admin_terms = ['diploma', 'universit', 'privilegium', 'statuta', 'acta', 'decretum', 'constitutio']
    untranslated_admin = df[df['title'].str.lower().str.contains('|'.join(admin_terms), case=False, na=False)]

    print(f"📜 Administrative/University Documents: {len(untranslated_admin):,} works")

    # STRATEGY 2: SCIENTIFIC/MEDICAL WORKS (less likely translated)
    print("\n🔬 STRATEGY 2: SCIENTIFIC & MEDICAL WORKS")

    scientific_terms = ['medicina', 'anatomia', 'chirurgia', 'pharmacia', 'alchimia', 'astronomia', 'mathematica']
    scientific_works = df[df['title'].str.lower().str.contains('|'.join(scientific_terms), case=False, na=False)]

    print(f"🔬 Scientific/Medical Works: {len(scientific_works):,} works")

    # STRATEGY 3: OBSCURE OR TECHNICAL WORKS
    print("\n📚 STRATEGY 3: TECHNICAL & OBSCURE WORKS")

    # Long technical titles (often treatises)
    df['title_length'] = df['title'].str.len()
    technical_works = df[df['title_length'] > 100]  # Long titles likely technical

    # Filter out famous classical authors (likely translated)
    famous_authors = ['cicero', 'virgil', 'ovid', 'horace', 'livy', 'tacitus', 'pliny']
    technical_works = technical_works[~technical_works['creator'].str.lower().str.contains('|'.join(famous_authors), na=False)]

    print(f"⚙️  Technical/Obcure Works: {len(technical_works):,} works")

    # STRATEGY 4: REGIONAL/HISTORICAL WORKS
    print("\n🏛️  STRATEGY 4: REGIONAL & HISTORICAL WORKS")

    regional_terms = ['chronicon', 'annales', 'historia', 'gesta', 'vitae', 'biographia']
    regional_works = df[df['title'].str.lower().str.contains('|'.join(regional_terms), case=False, na=False)]

    # Remove famous historical works
    regional_works = regional_works[~regional_works['title'].str.lower().str.contains('romana', na=False)]
    regional_works = regional_works[~regional_works['creator'].str.lower().str.contains('livy|tacitus', na=False)]

    print(f"🏰 Regional/Historical Works: {len(regional_works):,} works")

    # Combine all untranslated candidates
    all_untranslated = pd.concat([
        untranslated_admin,
        scientific_works,
        technical_works,
        regional_works
    ]).drop_duplicates()

    print(f"\n🎯 TOTAL UNTRANSLATED CANDIDATES: {len(all_untranslated):,} works")

    # PRIORITY SCORING
    def calculate_priority(row):
        score = 5.0  # Base score

        title_lower = str(row['title']).lower()
        creator_lower = str(row['creator']).lower()

        # Higher priority for 15th-16th century works
        year = row['clean_year']
        if year <= 1500:
            score += 2.0  # Incunabula bonus
        elif year <= 1600:
            score += 1.5  # Renaissance bonus

        # Lower priority for famous authors
        if any(author in creator_lower for author in ['cicero', 'virgil', 'ovid', 'pliny']):
            score -= 2.0

        # Higher priority for scientific/medical
        if any(term in title_lower for term in ['medicina', 'anatomia', 'astronomia']):
            score += 1.0

        # Higher priority for university documents
        if 'universit' in title_lower or 'diploma' in title_lower:
            score += 0.5

        return score

    all_untranslated['priority_score'] = all_untranslated.apply(calculate_priority, axis=1)
    all_untranslated = all_untranslated.sort_values('priority_score', ascending=False)

    # Create final prioritized list
    final_list = all_untranslated[['title', 'creator', 'clean_year', 'priority_score', 'language', 'publisher']].copy()
    final_list.columns = ['Title', 'Author', 'Year', 'Priority_Score', 'Language', 'Publisher']

    # Save the list
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"data/untranslated_latin_works_{timestamp}.csv"
    final_list.to_csv(output_file, index=False, encoding='utf-8-sig')

    print(f"\n💾 Saved prioritized list to {output_file}")

    # Show top candidates
    print(f"\n🏆 TOP 20 UNTRANSLATED WORKS (by priority):")
    for i, (_, work) in enumerate(final_list.head(20).iterrows(), 1):
        title = work['Title'][:80] + '...' if len(work['Title']) > 80 else work['Title']
        print(f"{i:2d}. {title} ({work['Year']}) - Priority: {work['Priority_Score']:.1f}")
        print(f"     Author: {work['Author'][:60]}")

    # Statistics by category
    print(f"\n📊 UNTRANSLATED BY CENTURY:")
    century_counts = all_untranslated.groupby(all_untranslated['clean_year'] // 100 * 100).size()
    for century, count in century_counts.sort_index().items():
        century_name = f"{century}s"
        if century == 1400: century_name = "15th Century"
        elif century == 1500: century_name = "16th Century"
        elif century == 1600: century_name = "17th Century"
        print(f"  {century_name}: {count:,} works")

    return output_file, len(all_untranslated)

if __name__ == "__main__":
    output_file, total_count = identify_untranslated_works()

    print(f"\n🎉 SUCCESS!")
    print(f"📄 Created list of {total_count:,} untranslated Latin works")
    print(f"💾 Saved to: {output_file}")
    print(f"📊 Ready for research planning and translation prioritization")