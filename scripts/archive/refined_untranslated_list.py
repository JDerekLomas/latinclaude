#!/usr/bin/env python3
"""
Create a refined, deduplicated list of untranslated works
"""

import pandas as pd
import re
from datetime import datetime

def create_refined_untranslated_list():
    """Create a clean, prioritized list of untranslated works"""

    print("🔍 CREATING REFINED UNTRANSLATED WORKS LIST")
    print("=" * 55)

    # Load our massive dataset
    df = pd.read_csv('data/massive_latin_collection_20251119_091153.csv')

    # Clean and deduplicate
    df['title_clean'] = df['title'].str.strip()
    df['creator_clean'] = df['creator'].str.strip()

    # Remove exact duplicates
    df_unique = df.drop_duplicates(subset=['title_clean', 'creator_clean', 'year'])
    print(f"📚 After deduplication: {len(df_unique):,} unique works")

    def extract_year(year_str):
        if pd.isna(year_str) or year_str == '':
            return None
        year_match = re.search(r'(\d{4})', str(year_str))
        return int(year_match.group(1)) if year_match else None

    df_unique['clean_year'] = df_unique['year'].apply(extract_year)
    df_unique = df_unique.dropna(subset=['clean_year'])

    # SOPHISTICATED TRANSLATION STATUS ASSESSMENT
    def assess_translation_status(row):
        title_lower = str(row['title_clean']).lower()
        creator_lower = str(row['creator_clean']).lower()
        year = row['clean_year']

        # DEFINITELY TRANSLATED (high probability)
        famous_classical = ['cicero', 'virgil', 'ovid', 'horace', 'livy', 'tacitus', 'pliny', 'seneca']
        famous_works = ['de civitate dei', 'summa theologica', 'principia philosophiae', 'ethica']

        if any(author in creator_lower for author in famous_classical):
            return 'likely_translated'
        if any(work in title_lower for work in famous_works):
            return 'likely_translated'

        # DEFINITELY UNTRANSLATED (very high probability)
        if any(term in title_lower for term in ['diploma', 'universit', 'privilegium', 'statuta']):
            return 'almost_certainly_untranslated'
        if any(term in title_lower for term in ['acta', 'decretum', 'constitutio']):
            return 'almost_certainly_untranslated'

        # LIKELY UNTRANSLATED (specialized works)
        specialized_terms = [
            'anatomia', 'pharmacia', 'chirurgia', 'alchimia', 'botanica',
            'practica medica', 'de peste', 'de febribus'
        ]
        if any(term in title_lower for term in specialized_terms):
            return 'likely_untranslated'

        # PROBABLY UNTRANSLATED (technical/rare works)
        technical_indicators = [
            'tractatus de', 'commentarii in', 'quaestiones', 'disputationes',
            'theses', 'dissertationes', 'corpus juris', 'de jure'
        ]
        if any(term in title_lower for term in technical_indicators):
            return 'probably_untranslated'

        # UNCERTAIN (need research)
        return 'translation_status_uncertain'

    df_unique['translation_status'] = df_unique.apply(assess_translation_status, axis=1)

    # PRIORITY SCORING SYSTEM
    def calculate_research_priority(row):
        score = 5.0  # Base score
        title_lower = str(row['title_clean']).lower()
        creator_lower = str(row['creator_clean']).lower()
        year = row['clean_year']
        status = row['translation_status']

        # Translation status priority
        if status == 'almost_certainly_untranslated':
            score += 3.0
        elif status == 'likely_untranslated':
            score += 2.5
        elif status == 'probably_untranslated':
            score += 2.0
        elif status == 'likely_translated':
            score -= 3.0

        # Historical period priority
        if year <= 1500:
            score += 2.0  # Incunabula bonus
        elif year <= 1550:
            score += 1.5  # Early Renaissance
        elif year <= 1650:
            score += 1.0  # Late Renaissance/Early Modern

        # Subject area priority
        if any(term in title_lower for term in ['medicina', 'anatomia', 'chirurgia']):
            score += 1.5  # Medical works
        elif any(term in title_lower for term in ['astronomia', 'mathematica']):
            score += 1.5  # Scientific works
        elif 'philosophia' in title_lower or 'ethica' in title_lower:
            score += 1.0  # Philosophical works

        # Document type priority
        if any(term in title_lower for term in ['diploma', 'universit']):
            score += 0.5  # Administrative documents
        elif any(term in title_lower for term in ['corpus juris', 'de jure']):
            score += 0.5  # Legal works

        # Length and complexity (longer titles often more significant)
        title_length = len(row['title_clean'])
        if title_length > 200:
            score += 0.5
        elif title_length > 100:
            score += 0.3

        return score

    df_unique['research_priority'] = df_unique.apply(calculate_research_priority, axis=1)

    # Filter for untranslated candidates
    untranslated_statuses = [
        'almost_certainly_untranslated',
        'likely_untranslated',
        'probably_untranslated'
    ]

    untranslated_candidates = df_unique[
        df_unique['translation_status'].isin(untranslated_statuses)
    ].copy()

    print(f"\n🎯 TRANSLATION STATUS BREAKDOWN:")
    for status, count in df_unique['translation_status'].value_counts().items():
        print(f"  {status.replace('_', ' ').title()}: {count:,} works")

    print(f"\n📊 UNTRANSLATED CANDIDATES: {len(untranslated_candidates):,} works")

    # Sort by priority
    untranslated_candidates = untranslated_candidates.sort_values(
        'research_priority', ascending=False
    )

    # Create final output columns
    output_columns = [
        'title_clean',
        'creator_clean',
        'clean_year',
        'translation_status',
        'research_priority',
        'language',
        'publisher'
    ]

    final_list = untranslated_candidates[output_columns].copy()
    final_list.columns = [
        'Title',
        'Author',
        'Year',
        'Translation_Status',
        'Research_Priority',
        'Language',
        'Publisher'
    ]

    # Save the refined list
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"data/refined_untranslated_latin_works_{timestamp}.csv"
    final_list.to_csv(output_file, index=False, encoding='utf-8-sig')

    print(f"\n💾 Refined list saved to {output_file}")

    # Display top candidates by category
    print(f"\n🏆 TOP 20 HIGH-PRIORITY UNTRANSLATED WORKS:")
    for i, (_, work) in enumerate(final_list.head(20).iterrows(), 1):
        title = work['Title'][:70] + '...' if len(work['Title']) > 70 else work['Title']
        status = work['Translation_Status'].replace('_', ' ').title()
        print(f"{i:2d}. {title} ({work['Year']})")
        print(f"     Author: {work['Author'][:50]}")
        print(f"     Status: {status} | Priority: {work['Research_Priority']:.1f}")

    # Create summary by century and status
    print(f"\n📊 UNTRANSLATED BY CENTURY:")
    for status in untranslated_statuses:
        status_data = untranslated_candidates[
            untranslated_candidates['translation_status'] == status
        ]
        if len(status_data) > 0:
            century_counts = status_data.groupby(status_data['clean_year'] // 100 * 100).size()
            status_display = status.replace('_', ' ').title()
            print(f"\n  {status_display}:")
            for century, count in century_counts.sort_index().items():
                century_name = f"{century}s"
                if century == 1400: century_name = "15th Century"
                elif century == 1500: century_name = "16th Century"
                elif century == 1600: century_name = "17th Century"
                print(f"    {century_name}: {count:,} works")

    return output_file, len(final_list)

if __name__ == "__main__":
    output_file, total_count = create_refined_untranslated_list()

    print(f"\n🎉 REFINED LIST COMPLETE!")
    print(f"📄 Created prioritized list of {total_count:,} untranslated works")
    print(f"💾 Saved to: {output_file}")
    print(f"📊 Ready for translation project planning")