#!/usr/bin/env python3
"""
Generate high-quality sample Neo-Latin data for demonstration purposes.
This creates realistic bibliographic records that would be found in major catalogues.
"""

import json
import random
from datetime import datetime
from typing import List, Dict

# Sample Neo-Latin authors and their works
NEOLATIN_WORKS = [
    {
        "title": "De Revolutionibus Orbium Coelestium",
        "author": "Nicolaus Copernicus",
        "year": 1543,
        "publisher": "Johannes Petreius",
        "place": "Nuremberg",
        "language": "lat",
        "subjects": ["Astronomy", "Science"],
        "description": "Copernicus's groundbreaking work on the heliocentric model"
    },
    {
        "title": "De Principiis Philosophiae",
        "author": "Renatus Cartesius (René Descartes)",
        "year": 1644,
        "publisher": "Lodowijk Elzevir",
        "place": "Amsterdam",
        "language": "lat",
        "subjects": ["Philosophy", "Science"],
        "description": "Descartes's foundational work on philosophy and science"
    },
    {
        "title": "Ethica",
        "author": "Baruch de Spinoza",
        "year": 1677,
        "publisher": "Rasp",
        "place": "Amsterdam",
        "language": "lat",
        "subjects": ["Philosophy", "Ethics"],
        "description": "Spinoza's major work on ethics and metaphysics"
    },
    {
        "title": "Institutio Principis Christiani",
        "author": "Johannes Calvin",
        "year": 1536,
        "publisher": "Johannes Crispin",
        "place": "Geneva",
        "language": "lat",
        "subjects": ["Theology", "Political Philosophy"],
        "description": "Calvin's work on the education of a Christian prince"
    },
    {
        "title": "De Civitate Dei",
        "author": "Augustinus",
        "year": 1485,
        "publisher": "Johann Amerbach",
        "place": "Basel",
        "language": "lat",
        "subjects": ["Theology", "Philosophy"],
        "description": "Augustine's monumental work on Christian philosophy"
    },
    {
        "title": "Commentaria in Aristotelem",
        "author": "Pietro Pomponazzi",
        "year": 1521,
        "publisher": "Aldus Manutius",
        "place": "Venice",
        "language": "lat",
        "subjects": ["Philosophy", "Aristotelianism"],
        "description": "Renaissance commentaries on Aristotle challenging scholastic tradition"
    },
    {
        "title": "De Humani Corporis Fabrica",
        "author": "Andreas Vesalius",
        "year": 1543,
        "publisher": "Johannes Oporinus",
        "place": "Basel",
        "language": "lat",
        "subjects": ["Medicine", "Anatomy"],
        "description": "Revolutionary work on human anatomy"
    },
    {
        "title": "Ars Magna",
        "author": "Girolamo Cardano",
        "year": 1545,
        "publisher": "Johannes Petreius",
        "place": "Nuremberg",
        "language": "lat",
        "subjects": ["Mathematics", "Algebra"],
        "description": "Foundational work on algebra and cubic equations"
    },
    {
        "title": "De Verrem",
        "author": "Marcus Tullius Cicero",
        "year": 1470,
        "publisher": "Johann Fust and Peter Schöffer",
        "place": "Mainz",
        "language": "lat",
        "subjects": ["Rhetoric", "Roman History"],
        "description": "Cicero's prosecution speeches against Verres"
    },
    {
        "title": "Aeneis",
        "author": "Publius Vergilius Maro",
        "year": 1470,
        "publisher": "Sweynheym and Pannartz",
        "place": "Rome",
        "language": "lat",
        "subjects": ["Poetry", "Epic Literature"],
        "description": "Virgil's epic poem about Aeneas and the founding of Rome"
    },
    {
        "title": "De Orbibus Coelestium",
        "author": "Georgius Peurbach",
        "year": 1473,
        "publisher": "Erhard Ratdolt",
        "place": "Venice",
        "language": "lat",
        "subjects": ["Astronomy", "Science"],
        "description": "Medieval textbook on planetary theory"
    },
    {
        "title": "Summa Theologica",
        "author": "Thomas Aquinas",
        "year": 1485,
        "publisher": "Anton Koberger",
        "place": "Nuremberg",
        "language": "lat",
        "subjects": ["Theology", "Philosophy"],
        "description": "Comprehensive work of Christian theology"
    },
    {
        "title": "De Anima",
        "author": "Aristoteles (Aristotle)",
        "year": 1476,
        "publisher": "Nicolas Jenson",
        "place": "Venice",
        "language": "lat",
        "subjects": ["Philosophy", "Psychology"],
        "description": "Aristotle's treatise on the soul"
    },
    {
        "title": "Historia Naturalis",
        "author": "Plinius Secundus (Pliny the Elder)",
        "year": 1470,
        "publisher": "Johann de Colonia and Johann Manthen",
        "place": "Venice",
        "language": "lat",
        "subjects": ["Natural History", "Science"],
        "description": "Comprehensive encyclopedia of natural world knowledge"
    },
    {
        "title": "De Amore",
        "author": "Andreas Capellanus",
        "year": 1490,
        "publisher": "Johann Froben",
        "place": "Basel",
        "language": "lat",
        "subjects": ["Literature", "Courtly Love"],
        "description": "Treatise on courtly love"
    },
    {
        "title": "Utopia",
        "author": "Thomas Morus (Thomas More)",
        "year": 1516,
        "publisher": "Thierry Martens",
        "place": "Louvain",
        "language": "lat",
        "subjects": ["Political Philosophy", "Utopian Literature"],
        "description": "More's famous work on an ideal society"
    },
    {
        "title": "Novum Organum",
        "author": "Franciscus Bacon (Francis Bacon)",
        "year": 1620,
        "publisher": "John Haviland",
        "place": "London",
        "language": "lat",
        "subjects": ["Philosophy", "Science"],
        "description": "Bacon's work on inductive reasoning and scientific method"
    },
    {
        "title": "Discours de la Méthode",
        "author": "Renatus Cartesius (René Descartes)",
        "year": 1637,
        "publisher": "Jan Maire",
        "place": "Leiden",
        "language": "lat",
        "subjects": ["Philosophy", "Science"],
        "description": "Descartes's philosophical work on methodical doubt"
    },
    {
        "title": "De Rerum Natura",
        "author": "Titus Lucretius Carus",
        "year": 1473,
        "publisher": "Ulrich Han",
        "place": "Rome",
        "language": "lat",
        "subjects": ["Philosophy", "Poetry"],
        "description": "Lucretius's epic poem explaining Epicurean philosophy"
    },
    {
        "title": "Geographia",
        "author": "Claudius Ptolemaeus (Ptolemy)",
        "year": 1475,
        "publisher": "Arnold Pannartz and Conrad Sweynheym",
        "place": "Rome",
        "language": "lat",
        "subjects": ["Geography", "Science"],
        "description": "Ptolemy's comprehensive work on geography"
    }
]

def generate_digitization_status(record: Dict) -> tuple:
    """Generate realistic digitization and translation status."""
    # Earlier works have higher chance of being digitized
    year = record.get('year', 1600)
    digit_prob = 0.3 if year < 1500 else 0.2 if year < 1600 else 0.4
    translation_prob = 0.4 if year < 1500 else 0.6 if year < 1600 else 0.3

    is_digitized = random.random() < digit_prob
    has_translation = random.random() < translation_prob

    if is_digitized:
        digitization_status = random.choice(['digitized', 'preview_only'])
    else:
        digitization_status = random.choice(['not_found', 'metadata_only'])

    if has_translation:
        translation_status = random.choice(['translated', 'possibly_translated'])
    else:
        translation_status = 'not_translated'

    return digitization_status, translation_status

def generate_variants(base_work: Dict, num_variants: int = 3) -> List[Dict]:
    """Generate publication variants and editions of the same work."""
    variants = []

    # Editions often published in different years/places
    year_offset = random.choice([-5, -3, -1, 1, 3, 5, 10, 15, 20])
    base_year = base_work['year']

    # Common Renaissance printing centers
    places = ['Venice', 'Rome', 'Florence', 'Paris', 'Basel', 'Geneva', 'Lyon',
              'Cologne', 'Nuremberg', 'Wittenberg', 'Oxford', 'Cambridge', 'Leiden']
    original_place = base_work.get('place', 'Venice')
    if original_place in places:
        places.remove(original_place)  # Remove original place

    publishers = [
        'Aldus Manutius', 'Johannes Petreius', 'Johann Froben', 'Henri Estienne',
        'Christoph Plantin', 'Theodor de Bry', 'Giunta', 'Johann Amerbach',
        'Anton Koberger', 'Nicolas Jenson', 'Erhard Ratdolt', 'Michael Isingrin'
    ]

    for i in range(num_variants):
        variant = base_work.copy()

        # Vary the title slightly for different editions
        if i > 0:
            title_modifiers = ['', 'Commentarii in ', 'In librum ', 'Expositio ']
            variant['title'] = random.choice(title_modifiers) + base_work['title']

        variant['year'] = max(1450, min(1700, base_year + year_offset * (i + 1)))
        variant['place'] = random.choice(places)
        variant['publisher'] = random.choice(publishers)

        # Generate unique identifier
        variant['archive_id'] = f"neo_latin_{base_work['title'].replace(' ', '_').lower()}_{variant['year']}"

        # Assign digitization status
        digit_status, trans_status = generate_digitization_status(variant)
        variant['digitization_status'] = digit_status
        variant['translation_status'] = trans_status

        variants.append(variant)

    return variants

def generate_large_dataset(num_records: int = 500) -> List[Dict]:
    """Generate a large dataset of Neo-Latin works."""
    all_records = []

    # First, create the core works
    for work in NEOLATIN_WORKS:
        # Generate variants of each work
        variants = generate_variants(work, num_variants=random.randint(2, 5))
        all_records.extend(variants)

    # If we need more records, create additional plausible works
    while len(all_records) < num_records:
        # Create a variant based on a random base work
        base_work = random.choice(NEOLATIN_WORKS)

        # Make it more unique
        variant = base_work.copy()

        # Change some attributes to make it unique
        if random.random() < 0.3:  # 30% chance to modify title
            prefixes = ['De ', 'In ', 'Ad ', 'Commentarii ', 'Tractatus ', 'Dialogus ']
            if not any(variant['title'].startswith(p) for p in prefixes):
                variant['title'] = random.choice(prefixes) + variant['title']

        # Randomize year within plausible range
        year_range = random.randint(10, 50)
        variant['year'] = max(1450, min(1700, variant['year'] + random.randint(-year_range, year_range)))

        # Randomize place and publisher
        places = ['Venice', 'Paris', 'Basel', 'Geneva', 'Lyon', 'Cologne', 'Rome', 'Wittenberg']
        publishers = ['Local Publisher', 'Academic Press', 'University Press', 'Private Press']
        variant['place'] = random.choice(places)
        variant['publisher'] = random.choice(publishers)

        # Generate unique identifier
        variant['archive_id'] = f"generated_neolatin_{len(all_records):04d}_{variant['year']}"

        # Assign digitization status
        digit_status, trans_status = generate_digitization_status(variant)
        variant['digitization_status'] = digit_status
        variant['translation_status'] = trans_status

        all_records.append(variant)

    return all_records[:num_records]

def save_records(records: List[Dict], filename: str):
    """Save records to CSV file."""
    import csv

    fieldnames = ['archive_id', 'title', 'author', 'publication_year', 'publisher',
                  'place', 'language', 'description', 'digitization_status',
                  'translation_status', 'subjects', 'source_catalogue']

    with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for record in records:
            row = {field: record.get(field, '') for field in fieldnames}
            row['publication_year'] = record.get('year', '')
            writer.writerow(row)

if __name__ == "__main__":
    # Generate a large dataset
    print("Generating large Neo-Latin dataset...")
    records = generate_large_dataset(num_records=500)

    print(f"Generated {len(records)} records")

    # Save to raw data directory
    import os
    os.makedirs('data/raw/generated', exist_ok=True)

    # Save as JSON for processing
    json_filename = 'data/raw/generated/large_neolatin_dataset.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Saved to {json_filename}")

    # Save some sample records as CSV for immediate inspection
    save_records(records[:50], 'data/raw/generated/sample_neolatin_records.csv')
    print("Saved 50 sample records to CSV")

    # Print some statistics
    years = [r['year'] for r in records if r.get('year')]
    print(f"\nDataset Statistics:")
    print(f"  Total records: {len(records)}")
    print(f"  Year range: {min(years)} - {max(years)}")
    print(f"  Unique authors: {len(set(r['author'] for r in records))}")
    print(f"  Digitized: {len([r for r in records if r.get('digitization_status') == 'digitized'])}")
    print(f"  Not digitized: {len([r for r in records if r.get('digitization_status') in ['not_found', 'metadata_only']])}")
    print(f"  Translated: {len([r for r in records if r.get('translation_status') == 'translated'])}")
    print(f"  Not translated: {len([r for r in records if r.get('translation_status') == 'not_translated'])}")