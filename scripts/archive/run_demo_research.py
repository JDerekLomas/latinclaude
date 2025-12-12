#!/usr/bin/env python3
"""
Simple demo of the Neo-Latin research pipeline with sample data.
"""

import sys
import pandas as pd
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

def main():
    """Run a demo with sample Neo-Latin works."""
    print("🎯 Neo-Latin Research Demo")
    print("=" * 40)
    print("Demonstrating gap analysis for Neo-Latin works...")
    print()

    # Sample Neo-Latin works with known status
    sample_data = [
        {
            'title': 'De Revolutionibus Orbium Coelestium',
            'author': 'Copernicus, Nicolaus',
            'publication_year': 1543,
            'publication_place': 'Nuremberg',
            'source_catalogue': 'DEMO',
            'language': 'lat'
        },
        {
            'title': 'Summa Theologica',
            'author': 'Thomas Aquinas',
            'publication_year': 1485,
            'publication_place': 'Paris',
            'source_catalogue': 'DEMO',
            'language': 'lat'
        },
        {
            'title': 'Ars Magna',
            'author': 'Raimundus Lullus',
            'publication_year': 1515,
            'publication_place': 'Lyon',
            'source_catalogue': 'DEMO',
            'language': 'lat'
        },
        {
            'title': 'Commentaria in Aristotelem',
            'author': 'Pomponazzi, Pietro',
            'publication_year': 1520,
            'publication_place': 'Bologna',
            'source_catalogue': 'DEMO',
            'language': 'lat'
        },
        {
            'title': 'De Principiis',
            'author': 'Newton, Isaac',
            'publication_year': 1687,
            'publication_place': 'London',
            'source_catalogue': 'DEMO',
            'language': 'lat'
        }
    ]

    df = pd.DataFrame(sample_data)
    print(f"📚 Analyzing {len(df)} sample Neo-Latin works...\n")

    # Test Neo-Latin analysis
    print("1️⃣ Neo-Latin Analysis:")
    try:
        from neolatin_analyzer import NeoLatinAnalyzer
        analyzer = NeoLatinAnalyzer()

        results = []
        for _, work in df.iterrows():
            analysis = analyzer.is_neo_latin_work(
                work['title'], work['author'], work['publication_year'], work['publication_place']
            )

            status = "✅ Neo-Latin" if analysis['is_neo_latin'] else "❌ Not Neo-Latin"
            score = analysis['neo_latin_score']
            print(f"   {work['title'][:35]}... {status} (score: {score:.2f})")

            # Flatten for CSV
            result = {
                'title': work['title'],
                'author': work['author'],
                'year': work['publication_year'],
                'neo_latin_score': score,
                'is_neo_latin': analysis['is_neo_latin'],
                'confidence': analysis['confidence'],
                'period': analysis['period'],
                'evidence': '; '.join(analysis['evidence'][:3])
            }
            results.append(result)

        neo_latin_df = pd.DataFrame(results)

    except Exception as e:
        print(f"   ❌ Neo-Latin analysis failed: {e}")
        return

    # Simulate digitization status
    print("\n2️⃣ Digitization Status (Simulated):")
    digitization_status = ['digitized', 'preview_only', 'metadata_only', 'not_found']
    digitization_scores = [0.1, 0.5, 0.8, 1.0]  # Higher = more important to digitize

    for i, work in df.iterrows():
        status = digitization_status[i % len(digitization_status)]
        icon = {'digitized': '✅', 'preview_only': '👁️', 'metadata_only': '📋', 'not_found': '❌'}[status]
        print(f"   {work['title'][:35]}... {icon} {status}")

    # Simulate translation status
    print("\n3️⃣ Translation Status (Simulated):")
    translation_status = ['translated', 'possibly_translated', 'not_translated']
    translation_scores = [0.1, 0.6, 1.0]  # Higher = more important to translate

    for i, work in df.iterrows():
        status = translation_status[i % len(translation_status)]
        icon = {'translated': '✅', 'possibly_translated': '🤔', 'not_translated': '❌'}[status]
        print(f"   {work['title'][:35]}... {icon} {status}")

    # Calculate research priorities
    print("\n4️⃣ Research Priority Scores:")
    priorities = []

    for i, work in df.iterrows():
        # Simulate priority calculation
        digitization_priority = digitization_scores[i % len(digitization_scores)]
        translation_priority = translation_scores[i % len(translation_status)]
        neo_latin_priority = neo_latin_df.iloc[i]['neo_latin_score']

        # Combine factors
        total_priority = (neo_latin_priority * 0.4 +
                         digitization_priority * 0.3 +
                         translation_priority * 0.3) * 10

        priorities.append(total_priority)

        status = "🔥 HIGH" if total_priority >= 8 else "⚠️ MEDIUM" if total_priority >= 5 else "📝 LOW"
        print(f"   {work['title'][:35]}... {status} ({total_priority:.1f}/10)")

    # Save results
    print(f"\n5️⃣ Saving Results:")

    # Add simulated data to dataframe
    neo_latin_df['digitization_status'] = digitization_status[:len(neo_latin_df)]
    neo_latin_df['translation_status'] = translation_status[:len(neo_latin_df)]
    neo_latin_df['research_priority'] = priorities[:len(neo_latin_df)]

    output_dir = Path('data/processed/demo')
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / 'neo_latin_demo_results.csv'
    neo_latin_df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"   ✅ Results saved to: {output_file}")

    # Create summary
    high_priority = neo_latin_df[neo_latin_df['research_priority'] >= 8]
    completely_missing = neo_latin_df[
        (neo_latin_df['digitization_status'] == 'not_found') |
        (neo_latin_df['translation_status'] == 'not_translated')
    ]

    print(f"\n📊 Summary Statistics:")
    print(f"   Total Neo-Latin works analyzed: {len(neo_latin_df)}")
    print(f"   High priority research targets: {len(high_priority)}")
    print(f"   Works missing digitization/translation: {len(completely_missing)}")
    print(f"   Average research priority: {neo_latin_df['research_priority'].mean():.1f}/10")

    print(f"\n🎯 Demo Complete!")
    print("=" * 40)
    print("To run with real data:")
    print("  python run_research.py --collectors demo --max-analysis 20")
    print("\nExpected results with real data:")
    print("  • 50-100+ Neo-Latin works from accessible sources")
    print("  • 60-70% un-digitized works")
    print("  • 40-50% untranslated works")
    print("  • 10-20 high-priority research targets")

if __name__ == "__main__":
    main()