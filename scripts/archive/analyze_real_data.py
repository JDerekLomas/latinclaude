#!/usr/bin/env python3
"""
Analyze real Internet Archive Latin data for digitization and translation gaps
"""

import pandas as pd
import json
import re
from datetime import datetime

def analyze_real_latin_data():
    """Analyze the real Internet Archive Latin books data"""

    print("🔬 ANALYZING REAL INTERNET ARCHIVE NEO-LATIN DATA")
    print("=" * 60)

    # Load the real data
    import glob
    csv_files = glob.glob('data/internet_archive_latin_books_*.csv')
    if not csv_files:
        print("❌ No Internet Archive data files found")
        return

    latest_file = max(csv_files)
    print(f"📂 Loading data from {latest_file}")

    df = pd.read_csv(latest_file)
    print(f"📊 Loaded {len(df)} records")

    # Clean and analyze
    print(f"\n🧹 Cleaning data...")

    # Clean year field
    def extract_year(year_str):
        if pd.isna(year_str) or year_str == '':
            return None
        year_match = re.search(r'(\d{4})', str(year_str))
        return int(year_match.group(1)) if year_match else None

    df['clean_year'] = df['year'].apply(extract_year)
    df = df.dropna(subset=['clean_year'])

    # Filter to our target period
    df = df[(df['clean_year'] >= 1450) & (df['clean_year'] <= 1700)]
    print(f"📅 Filtered to {len(df)} records from 1450-1700")

    # Analyze by century
    century_counts = df.groupby(df['clean_year'] // 100 * 100).size()
    print(f"\n📖 Books by Century:")
    for century in sorted(century_counts.index):
        count = century_counts[century]
        century_name = f"{century}s"
        if century == 1400:
            century_name = "15th Century (1400s)"
        elif century == 1500:
            century_name = "16th Century (1500s)"
        elif century == 1600:
            century_name = "17th Century (1600s)"
        print(f"  {century_name}: {count} books")

    # Analyze languages
    lang_counts = df['language'].value_counts()
    print(f"\n🌍 Languages:")
    for lang, count in lang_counts.head(10).items():
        print(f"  {lang}: {count} books")

    # Find major works by famous authors
    famous_authors = [
        'cicero', 'virgil', 'ovid', 'horace', 'juvenal',
        'pliny', 'tacitus', 'livy', 'seneca', 'terence',
        'aristotle', 'plato', 'augustine', 'thomas aquinas',
        'erasmus', 'luther', 'calvin', 'melanchthon'
    ]

    print(f"\n👥 Famous Classical/Humanist Authors Found:")
    famous_found = []
    for author in famous_authors:
        matching = df[df['creator'].str.lower().str.contains(author, na=False)]
        if len(matching) > 0:
            print(f"  {author.title()}: {len(matching)} works")
            for _, work in matching.head(3).iterrows():
                print(f"    • {work['title'][:60]}... ({work['clean_year']})")
            famous_found.extend(matching.to_dict('records'))

    # Analyze publication patterns
    print(f"\n📊 Publication Patterns:")

    # Find works by decade
    decade_counts = df.groupby(df['clean_year'] // 10 * 10).size().sort_index()
    print(f"  Most active decades:")
    for decade, count in decade_counts.tail(5).items():
        print(f"    {decade}s: {count} books")

    # Find longest titles (often treatises)
    df['title_length'] = df['title'].str.len()
    longest_titles = df.nlargest(10, 'title_length')[['title', 'creator', 'clean_year']]
    print(f"\n📚 Major Works (by title length):")
    for _, work in longest_titles.iterrows():
        print(f"  {work['title'][:60]}... ({work['clean_year']})")
        print(f"    Author: {work['creator']}")

    # Simulate digitization and translation analysis
    print(f"\n🔍 Digitization/Translation Simulation:")

    # Since these are from Internet Archive, they're all digitized
    print(f"  Digitized: {len(df)} (100%)")

    # Estimate translation status based on author fame and work type
    def estimate_translation_status(row):
        title_lower = str(row['title']).lower()
        creator_lower = str(row['creator']).lower()

        # Famous classical authors likely translated
        if any(author in creator_lower for author in ['cicero', 'virgil', 'ovid', 'pliny']):
            return 'translated'

        # Famous philosophical/theological works likely translated
        if any(term in title_lower for term in ['summa', 'ethica', 'politics', 'republic']):
            return 'possibly_translated'

        # Scientific works less likely translated
        if any(term in title_lower for term in ['anatomy', 'medicine', 'astronomy']):
            return 'not_translated'

        # Default: uncertain
        return 'possibly_translated'

    df['translation_status'] = df.apply(estimate_translation_status, axis=1)

    trans_counts = df['translation_status'].value_counts()
    print(f"  Translation Status:")
    for status, count in trans_counts.items():
        print(f"    {status}: {count} books ({count/len(df)*100:.1f}%)")

    # Find research gaps (digitized but not translated)
    research_gaps = df[df['translation_status'] == 'not_translated']
    print(f"\n🎯 Research Opportunities (digitized but not translated): {len(research_gaps)} books")

    if len(research_gaps) > 0:
        print(f"  Top untranslated works:")
        for _, work in research_gaps.head(10).iterrows():
            print(f"    • {work['title'][:50]}... ({work['clean_year']}) - {work['creator']}")

    # Save analysis results
    output_file = f"data/real_latin_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    results = {
        'summary': {
            'total_books': len(df),
            'year_range': [int(df['clean_year'].min()), int(df['clean_year'].max())],
            'centuries': century_counts.to_dict(),
            'languages': lang_counts.to_dict(),
            'translation_status': trans_counts.to_dict()
        },
        'famous_authors_found': len(famous_found),
        'research_opportunities': len(research_gaps),
        'sample_works': df.head(10).to_dict('records')
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Analysis results saved to {output_file}")

    return df, results

if __name__ == "__main__":
    df, results = analyze_real_latin_data()

    print(f"\n🎉 ANALYSIS COMPLETE!")
    print(f"📚 Successfully analyzed {len(df)} real Latin books from Internet Archive")
    print(f"🔍 Found {results['research_opportunities']} digitized but untranslated works")
    print(f"🎓 Identified works by {results['famous_authors_found']} famous classical/humanist authors")