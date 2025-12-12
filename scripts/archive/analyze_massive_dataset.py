#!/usr/bin/env python3
"""
Analyze the massive 9,000 book Internet Archive Latin dataset
"""

import pandas as pd
import json
import re
from datetime import datetime
import collections

def analyze_massive_latin_dataset():
    """Analyze the massive Latin books collection"""

    print("🔬 ANALYZING MASSIVE 9,000+ BOOK LATIN DATASET")
    print("=" * 70)

    # Load the massive dataset
    csv_files = [
        'data/massive_latin_collection_20251119_091153.csv',
        'data/internet_archive_latin_books_20251118_161518.csv',
        'data/internet_archive_latin_books_20251119_091000.csv'
    ]

    all_records = []
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            print(f"📂 Loaded {len(df)} records from {csv_file}")
            all_records.extend(df.to_dict('records'))
        except Exception as e:
            print(f"⚠️  Could not load {csv_file}: {e}")

    # Remove duplicates by identifier
    unique_records = {}
    for record in all_records:
        identifier = record.get('identifier', '')
        if identifier and identifier not in unique_records:
            unique_records[identifier] = record

    df = pd.DataFrame.from_dict(unique_records, orient='index')
    print(f"\n📊 After deduplication: {len(df)} unique records")

    # Clean and analyze years
    def extract_year(year_str):
        if pd.isna(year_str) or year_str == '':
            return None
        year_match = re.search(r'(\d{4})', str(year_str))
        return int(year_match.group(1)) if year_match else None

    df['clean_year'] = df['year'].apply(extract_year)
    df = df.dropna(subset=['clean_year'])

    # Filter to our period
    df = df[(df['clean_year'] >= 1450) & (df['clean_year'] <= 1700)]
    print(f"📅 Filtered to {len(df)} records from 1450-1700")

    # COMPREHENSIVE ANALYSIS
    print(f"\n📈 COMPREHENSIVE ANALYSIS")

    # Century distribution
    century_counts = df.groupby(df['clean_year'] // 100 * 100).size().sort_index()
    print(f"\n📖 Books by Century:")
    for century in sorted(century_counts.index):
        count = century_counts[century]
        percentage = count / len(df) * 100
        century_name = f"{century}s"
        if century == 1400:
            century_name = "15th Century (Incunabula)"
        elif century == 1500:
            century_name = "16th Century (Renaissance)"
        elif century == 1600:
            century_name = "17th Century (Early Modern)"
        print(f"  {century_name}: {count:,} books ({percentage:.1f}%)")

    # Decade distribution for detailed view
    decade_counts = df.groupby(df['clean_year'] // 10 * 10).size().sort_index()
    print(f"\n📊 Top Decades:")
    for decade, count in decade_counts.tail(10).items():
        print(f"  {decade}s: {count:,} books")

    # Language analysis
    lang_counts = df['language'].value_counts()
    print(f"\n🌍 Languages:")
    for lang, count in lang_counts.head(10).items():
        percentage = count / len(df) * 100
        print(f"  {lang}: {count:,} books ({percentage:.1f}%)")

    # FAMOUS AUTHORS ANALYSIS
    print(f"\n👥 FAMOUS AUTHORS ANALYSIS")

    famous_authors = {
        'Classical': ['cicero', 'virgil', 'ovid', 'horace', 'juvenal', 'terence', 'lucan', 'statius', 'catullus', 'persius'],
        'Medieval': ['augustine', 'boethius', 'thomas aquinas', 'bonaventure', 'duns scotus', 'william ockham'],
        'Renaissance': ['erasmus', 'luther', 'calvin', 'melanchthon', 'zwingli', 'reuchlin', 'vesalius'],
        'Scientific': ['copernicus', 'galileo', 'kepler', 'newton', 'bacon', 'descartes', 'spinoza', 'leibniz']
    }

    author_stats = {}
    total_famous_works = 0

    for category, authors in famous_authors.items():
        print(f"\n  {category.upper()}:")
        category_found = 0
        for author in authors:
            matching = df[df['creator'].str.lower().str.contains(author, na=False)]
            count = len(matching)
            if count > 0:
                category_found += count
                total_famous_works += count
                author_stats[author] = {
                    'count': count,
                    'category': category,
                    'works': matching.head(3)['title'].tolist()
                }
                print(f"    {author.title()}: {count} works")

        if category_found == 0:
            print(f"    No works found")

    print(f"\n🎓 Total Famous Author Works: {total_famous_works:,}")

    # TITLE ANALYSIS - Find major works by title patterns
    print(f"\n📚 MAJOR WORKS ANALYSIS")

    # Common Latin work types
    work_patterns = {
        'Bibles': ['biblia', 'biblia sacra', 'testamentum'],
        'Theology': ['summa', 'theologia', 'commentarii in ', 'tractatus de '],
        'Philosophy': ['philosophia', 'ethica', 'politica', 'de anima'],
        'Science': ['de natura', 'anatomia', 'astronomia', 'mathematica'],
        'Medicine': ['de medicina', 'practica', 'compendium'],
        'Law': ['de jure', 'leges', 'corpus juris'],
        'History': ['historia', 'annales', 'chronicon'],
        'Poetry': ['poemata', 'carmina', 'ode'],
        'Rhetoric': ['oratio', 'declamatio', 'institutio oratoria']
    }

    work_type_stats = {}
    for work_type, patterns in work_patterns.items():
        count = 0
        for pattern in patterns:
            count += df['title'].str.lower().str.contains(pattern).sum()
        if count > 0:
            work_type_stats[work_type] = count

    print(f"  Major Work Types Found:")
    for work_type, count in sorted(work_type_stats.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    {work_type}: {count:,} works")

    # TRANSLATION ANALYSIS
    print(f"\n🔍 TRANSLATION ANALYSIS")

    # Estimate translation status
    def estimate_translation_status(row):
        title_lower = str(row['title']).lower()
        creator_lower = str(row['creator']).lower()

        # Classical authors likely translated
        if any(author in creator_lower for author in ['cicero', 'virgil', 'ovid', 'pliny', 'horace', 'livy']):
            return 'likely_translated'

        # Famous philosophical works likely translated
        if any(term in title_lower for term in ['summa', 'ethica', 'de civitate dei', 'monarchia']):
            return 'likely_translated'

        # Major scientific works
        if any(term in title_lower for term in ['de revolutionibus', 'principia philosophiae', 'discours']):
            return 'likely_translated'

        # Latin Bible-related works
        if any(term in title_lower for term in ['biblia', 'testamentum', 'psalterium']):
            return 'likely_translated'

        # University diplomas and administrative documents
        if any(term in title_lower for term in ['diploma', 'universit', 'privilegium']):
            return 'unlikely_translated'

        # Medical treatises
        if any(term in title_lower for term in ['de medicina', 'practica medica']):
            return 'possibly_translated'

        # Default assessment
        return 'translation_uncertain'

    df['translation_status'] = df.apply(estimate_translation_status, axis=1)
    trans_counts = df['translation_status'].value_counts()

    print(f"  Translation Status:")
    for status, count in trans_counts.items():
        percentage = count / len(df) * 100
        print(f"    {status}: {count:,} books ({percentage:.1f}%)")

    # RESEARCH OPPORTUNITIES
    print(f"\n🎯 RESEARCH OPPORTUNITIES")

    untranslated = df[df['translation_status'] == 'unlikely_translated']
    possibly_untranslated = df[df['translation_status'] == 'translation_uncertain']
    print(f"  Clearly Untranslated: {len(untranslated):,} books")
    print(f"  Possibly Untranslated: {len(possibly_untranslated):,} books")
    print(f"  Total Translation Opportunities: {len(untranslated) + len(possibly_untranslated):,} books")

    # Sample untranslated works
    if len(untranslated) > 0:
        print(f"\n  Sample Untranslated Works:")
        for _, work in untranslated.head(10).iterrows():
            print(f"    • {work['title'][:60]}... ({work['clean_year']})")
            print(f"      Creator: {work['creator']}")

    # Save comprehensive analysis
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    analysis_file = f"data/massive_latin_analysis_{timestamp}.json"

    analysis_results = {
        'dataset_summary': {
            'total_books': len(df),
            'year_range': [int(df['clean_year'].min()), int(df['clean_year'].max())],
            'centuries': century_counts.to_dict(),
            'languages': lang_counts.head(10).to_dict(),
            'translation_status': trans_counts.to_dict()
        },
        'famous_authors': {
            'total_famous_works': total_famous_works,
            'categories': {author: {'count': stats['count'], 'category': stats['category']}
                          for author, stats in author_stats.items()}
        },
        'work_types': work_type_stats,
        'research_opportunities': {
            'clearly_untranslated': len(untranslated),
            'possibly_untranslated': len(possibly_untranslated),
            'total_opportunities': len(untranslated) + len(possibly_untranslated)
        },
        'top_untranslated': [{'title': row['title'][:100], 'year': row['clean_year'],
                               'creator': row['creator']}
                              for _, row in untranslated.head(20).iterrows()]
    }

    with open(analysis_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Comprehensive analysis saved to {analysis_file}")

    # Create summary report
    summary_file = f"data/latin_research_summary_{timestamp}.md"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("# MASSIVE LATIN RESEARCH COLLECTION SUMMARY\n\n")
        f.write(f"## Dataset Overview\n")
        f.write(f"- **Total Books:** {len(df):,}\n")
        f.write(f"- **Period:** {analysis_results['dataset_summary']['year_range'][0]}-{analysis_results['dataset_summary']['year_range'][1]}\n")
        f.write(f"- **Total Translation Opportunities:** {analysis_results['research_opportunities']['total_opportunities']:,} books\n\n")
        f.write("## Century Distribution\n")
        for century, count in analysis_results['dataset_summary']['centuries'].items():
            f.write(f"- **{century}s:** {count:,} books\n")
        f.write("\n## Key Findings\n")
        f.write(f"- **{analysis_results['famous_authors']['total_famous_works']:}** works by famous classical/renaissance authors\n")
        f.write(f"- **{analysis_results['research_opportunities']['clearly_untranslated']:,}** clearly untranslated works\n")
        f.write(f"- **{analysis_results['research_opportunities']['possibly_untranslated']:,}** possibly untranslated works\n")

    print(f"📝 Summary report saved to {summary_file}")

    return df, analysis_results

if __name__ == "__main__":
    df, results = analyze_massive_latin_dataset()

    print(f"\n🎉 MASSIVE ANALYSIS COMPLETE!")
    print(f"📚 Successfully analyzed {len(df):,} real Latin books from Internet Archive")
    print(f"🎓 Identified {results['famous_authors']['total_famous_works']:,} famous author works")
    print(f"🔍 Found {results['research_opportunities']['total_opportunities']:,} translation opportunities")
    print(f"📊 Comprehensive reports generated for research planning")