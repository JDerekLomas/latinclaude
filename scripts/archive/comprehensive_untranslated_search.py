#!/usr/bin/env python3
"""
Comprehensive search for untranslated Latin works across multiple categories
"""

import pandas as pd
import re
from datetime import datetime

def comprehensive_untranslated_search():
    """Create comprehensive lists by different categories"""

    print("🔍 COMPREHENSIVE UNTRANSLATED WORKS SEARCH")
    print("=" * 60)

    # Load dataset
    df = pd.read_csv('data/massive_latin_collection_20251119_091153.csv')

    def extract_year(year_str):
        if pd.isna(year_str) or year_str == '':
            return None
        year_match = re.search(r'(\d{4})', str(year_str))
        return int(year_match.group(1)) if year_match else None

    df['clean_year'] = df['year'].apply(extract_year)
    df = df.dropna(subset=['clean_year'])

    print(f"📚 Working with {len(df):,} Latin books")

    # CATEGORIES FOR UNTRANSLATED WORKS
    categories = {
        'Medical_Treatises': [
            'medicina', 'anatomia', 'chirurgia', 'pharmacia', 'botanica',
            'de peste', 'de febribus', 'de morbis', 'practica medica'
        ],
        'Legal_Works': [
            'corpus juris', 'de jure', 'leges', 'statuta', 'decretum',
            'constitutiones', 'privilegia', 'acta', 'fori'
        ],
        'Scientific_Treatises': [
            'astronomia', 'mathematica', 'optica', 'musica', 'alchimia',
            'physica', 'mechanica', 'geometria', 'arithmetica'
        ],
        'University_Administrative': [
            'diploma', 'universit', 'privilegium', 'statuta',
            'acta', 'matricula', 'graduationis'
        ],
        'Theological_Commentaries': [
            'commentarii in', 'expositio', 'glossa', 'quaestiones',
            'disputationes', 'theses', 'dissertationes'
        ],
        'Local_History_Chronicles': [
            'chronicon', 'annales', 'gesta', 'historia', 'vitae',
            'biographia', 'memoria'
        ],
        'Technical_Manuals': [
            'tractatus de', 'ars', 'de arte', 'instrumentum',
            'fabrica', 'constructio', 'practica'
        ]
    }

    results = {}

    for category, keywords in categories.items():
        print(f"\n🔍 Searching for {category.replace('_', ' ')}...")

        # Find works containing any keyword
        pattern = '|'.join(keywords)
        matches = df[df['title'].str.lower().str.contains(pattern, case=False, na=False)]

        # Exclude famous classical authors (likely translated)
        famous_authors = ['cicero', 'virgil', 'ovid', 'horace', 'livy', 'tacitus']
        matches = matches[~matches['creator'].str.lower().str.contains('|'.join(famous_authors), na=False)]

        # Exclude obvious famous works
        famous_works = ['de civitate dei', 'summa theologica', 'ethica nicomachea']
        matches = matches[~matches['title'].str.lower().str.contains('|'.join(famous_works), na=False)]

        print(f"  Found {len(matches)} works")

        results[category] = matches

        # Show some examples
        if len(matches) > 0:
            print(f"  Sample works:")
            for _, work in matches.head(3).iterrows():
                title = work['title'][:60] + '...' if len(work['title']) > 60 else work['title']
                print(f"    • {title} ({work['year']})")

    # Create comprehensive reports
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Master list of all untranslated candidates
    all_candidates = pd.concat([matches for matches in results.values()]).drop_duplicates()
    print(f"\n📊 SUMMARY:")
    print(f"  Total untranslated candidates: {len(all_candidates):,}")
    print(f"  Categories found: {len([r for r in results.values() if len(r) > 0])}")

    # Save comprehensive master list
    master_list = all_candidates[[
        ['title', 'creator', 'clean_year', 'language', 'publisher', 'identifier']
    ].copy()
    master_list.columns = ['Title', 'Author', 'Year', 'Language', 'Publisher', 'Archive_ID']

    master_file = f"data/comprehensive_untranslated_master_{timestamp}.csv"
    master_list.to_csv(master_file, index=False, encoding='utf-8-sig')

    print(f"\n💾 Master list saved to {master_file}")

    # Create category-specific files
    category_files = {}
    for category, matches in results.items():
        if len(matches) > 0:
            category_file = f"data/untranslated_{category}_{timestamp}.csv"
            category_list = matches[[
                ['title', 'creator', 'clean_year', 'language', 'publisher']
            ].copy()
            category_list.columns = ['Title', 'Author', 'Year', 'Language', 'Publisher']
            category_list.to_csv(category_file, index=False, encoding='utf-8-sig')
            category_files[category] = category_file
            print(f"  Saved {len(matches)} {category.replace('_', ' ')} to {category_file}")

    return master_file, category_files, len(all_candidates)

if __name__ == "__main__":
    master_file, category_files, total_count = comprehensive_untranslated_search()

    print(f"\n🎉 COMPREHENSIVE SEARCH COMPLETE!")
    print(f"📄 Master list: {master_file} ({total_count:,} works)")
    print(f"📁 Category files: {len(category_files)} separate lists")
    print(f"📊 Ready for detailed translation project planning")