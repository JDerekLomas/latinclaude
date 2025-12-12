#!/usr/bin/env python3
"""
Real Internet Archive Data Collector for Neo-Latin Works 1450-1700
"""

import requests
import json
import time
import pandas as pd
import re
from datetime import datetime

class InternetArchiveRealCollector:
    def __init__(self):
        self.base_url = "https://archive.org/advancedsearch.php"
        self.records = []

    def search_latin_books(self, max_pages=50):
        """Search for real Latin books from 1450-1700"""

        # Search for Latin works with better query
        query_parts = [
            "language:lat OR language:latin",  # Latin language
            "date:[1450 TO 1700]",              # Time period
            "NOT title:1 NOT title:2 NOT title:3 NOT title:4",  # Exclude numeric titles
            "NOT title:5 NOT title:6 NOT title:7 NOT title:8",
            "NOT title:9 NOT title:0",  # More exclusions
            "-mediatype:web"  # Exclude web pages
        ]

        search_query = " AND ".join(query_parts)

        print(f"🔍 Searching Internet Archive for Latin works 1450-1700...")
        print(f"Query: {search_query}")

        # Calculate starting page based on existing data
        start_page = len(self.records) // 100

        for page in range(start_page, start_page + max_pages):
            start = page * 100
            params = {
                'q': search_query,
                'fl[]': 'identifier,title,creator,date,language,description,publisher,year',
                'sort[]': 'publicdate desc',
                'rows': 100,
                'start': start,
                'output': 'json'
            }

            try:
                print(f"\n📄 Fetching page {page + 1} (records {start+1}-{start+100})...")
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()

                if 'response' not in data or 'docs' not in data['response']:
                    print(f"❌ No results found on page {page + 1}")
                    break

                docs = data['response']['docs']
                if not docs:
                    print("✅ No more records found")
                    break

                # Process records
                page_latin_books = 0
                for doc in docs:
                    if self._is_latin_book(doc):
                        self.records.append(self._clean_record(doc))
                        page_latin_books += 1

                total_found = data['response']['numFound']
                print(f"✅ Page {page + 1}: Found {page_latin_books} Latin books (Total available: {total_found})")

                # Rate limiting
                time.sleep(1)

            except Exception as e:
                print(f"❌ Error on page {page + 1}: {e}")
                continue

        print(f"\n🎉 Total Latin books collected: {len(self.records)}")
        return self.records

    def _is_latin_book(self, doc):
        """Determine if this is likely a Latin book"""
        title = str(doc.get('title', '')).strip()

        # Skip if no proper title
        if not title or len(title) < 3:
            return False

        # Skip numeric titles
        if title.isdigit():
            return False

        # Check for Latin indicators in title
        latin_patterns = [
            r'\bde\s+\w+',           # "de" + word
            r'\bad\s+\w+',           # "ad" + word
            r'\bin\s+\w+',           # "in" + word
            r'\bliber\b',            # liber
            r'\btractatus\b',        # tractatus
            r'\bcommentarii\b',      # commentarii
            r'\bepistola\b',         # epistola
            r'\boratio\b',           # oratio
            r'\bdisputation\b',      # disputation
            r'\bthesis\b',           # thesis
        ]

        title_lower = title.lower()
        for pattern in latin_patterns:
            if re.search(pattern, title_lower):
                return True

        # Check for Latin-looking words (endings)
        words = title_lower.split()[:5]  # Check first 5 words
        for word in words:
            if len(word) > 4:
                if word.endswith(('us', 'um', 'a', 'ae', 'is', 'es', 'i', 'o')):
                    # Avoid obvious non-Latin words
                    non_latin_words = ['house', 'church', 'school', 'library', 'catalogue']
                    if word not in non_latin_words:
                        return True

        # Check creator for Latin names
        creator = str(doc.get('creator', '')).lower()
        if any(name in creator for name in ['cicero', 'virgil', 'ovid', 'horace', 'juvenal']):
            return True

        return False

    def _clean_record(self, doc):
        """Clean and normalize a record"""
        def clean_field(value):
            if isinstance(value, list):
                return value[0] if value else ''
            return str(value) if value else ''

        # Extract year from date if possible
        date_str = doc.get('date', '')
        if date_str:
            year_match = re.search(r'(\d{4})', str(date_str))
            year = year_match.group(1) if year_match else ''
        else:
            year = doc.get('year', '')

        return {
            'identifier': clean_field(doc.get('identifier')),
            'title': clean_field(doc.get('title')),
            'creator': clean_field(doc.get('creator')),
            'date': clean_field(doc.get('date')),
            'year': clean_field(year),
            'language': clean_field(doc.get('language')),
            'description': clean_field(doc.get('description')),
            'publisher': clean_field(doc.get('publisher')),
            'source': 'Internet Archive',
            'collected_date': datetime.now().isoformat()
        }

    def save_to_csv(self, filename):
        """Save records to CSV file"""
        if not self.records:
            print("❌ No records to save")
            return

        df = pd.DataFrame(self.records)
        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"💾 Saved {len(self.records)} records to {filename}")

        # Show sample
        print(f"\n📊 Sample of collected records:")
        for i, record in enumerate(self.records[:5]):
            print(f"\n{i+1}. {record['title'][:80]}{'...' if len(record['title']) > 80 else ''}")
            print(f"   Creator: {record['creator']}")
            print(f"   Year: {record['year']}")
            print(f"   Language: {record['language']}")

def main():
    collector = InternetArchiveRealCollector()

    print("🔍 INTERNET ARCHIVE REAL NEO-LATIN DATA COLLECTOR")
    print("=" * 60)

    # Start collection
    records = collector.search_latin_books(max_pages=30)  # Get up to 3000 records

    if records:
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/internet_archive_latin_books_{timestamp}.csv"

        import os
        os.makedirs('data', exist_ok=True)

        collector.save_to_csv(filename)

        # Quick stats
        years = [int(r['year']) for r in records if r['year'] and r['year'].isdigit()]
        if years:
            print(f"\n📈 Collection Statistics:")
            print(f"  Total records: {len(records)}")
            print(f"  Year range: {min(years)} - {max(years)}")
            print(f"  Languages: {set(r['language'] for r in records if r['language'])}")
    else:
        print("❌ No Latin books found")

if __name__ == "__main__":
    main()