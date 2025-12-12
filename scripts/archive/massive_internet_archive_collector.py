#!/usr/bin/env python3
"""
Massive Internet Archive Data Collector - Get thousands of Latin books
"""

import requests
import json
import time
import pandas as pd
import re
from datetime import datetime

class MassiveInternetArchiveCollector:
    def __init__(self):
        self.base_url = "https://archive.org/advancedsearch.php"
        self.records = []

    def search_latin_books_massive(self, start_page=0, max_pages=100):
        """Collect massive amounts of Latin books"""

        # More comprehensive search
        query_parts = [
            "language:lat OR language:latin",
            "date:[1450 TO 1700]",
            "NOT title:1 NOT title:2 NOT title:3 NOT title:4 NOT title:5",
            "NOT title:6 NOT title:7 NOT title:8 NOT title:9 NOT title:0",
            "-mediatype:web -mediatype:collection"
        ]

        search_query = " AND ".join(query_parts)

        print(f"🔍 MASSIVE COLLECTION: Internet Archive Latin works 1450-1700")
        print(f"📊 Starting from page {start_page + 1}, collecting {max_pages} pages")
        print(f"Query: {search_query}")

        collected_this_session = 0

        for page_num in range(start_page, start_page + max_pages):
            start = page_num * 100

            params = {
                'q': search_query,
                'fl[]': 'identifier,title,creator,date,language,description,publisher,year',
                'sort[]': 'publicdate desc',
                'rows': 100,
                'start': start,
                'output': 'json'
            }

            try:
                print(f"\n📄 Page {page_num + 1} (records {start+1}-{start+100})...")
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()

                if 'response' not in data or 'docs' not in data['response']:
                    print(f"❌ No results found on page {page_num + 1}")
                    break

                docs = data['response']['docs']
                if not docs:
                    print("✅ No more records found")
                    break

                # Filter for genuine Latin books
                page_latin_books = 0
                for doc in docs:
                    if self._is_genuine_latin_book(doc):
                        self.records.append(self._clean_record(doc))
                        page_latin_books += 1
                        collected_this_session += 1

                total_available = data['response']['numFound']
                print(f"✅ Page {page_num + 1}: {page_latin_books} Latin books (Total available: {total_available})")

                # Progress update every 10 pages
                if (page_num + 1) % 10 == 0:
                    print(f"📈 Progress: {len(self.records)} total books collected")

                # Rate limiting
                time.sleep(0.5)  # Faster rate for massive collection

            except Exception as e:
                print(f"❌ Error on page {page_num + 1}: {e}")
                continue

        print(f"\n🎉 MASSIVE COLLECTION COMPLETE!")
        print(f"📚 This session: {collected_this_session} books")
        print(f"📊 Total collected: {len(self.records)} books")
        return self.records

    def _is_genuine_latin_book(self, doc):
        """Stricter filtering for genuine Latin books"""
        title = str(doc.get('title', '')).strip()

        # Skip invalid titles
        if not title or len(title) < 5 or title.isdigit():
            return False

        # Skip obviously modern titles
        modern_indicators = ['isbn', 'copyright', 'modern', 'edition', 'vol.']
        if any(indicator in title.lower() for indicator in modern_indicators):
            return False

        # Latin title indicators (more comprehensive)
        latin_patterns = [
            r'\bde\s+\w+', r'\bad\s+\w+', r'\bin\s+\w+', r'\bpro\s+\w+',
            r'\b liber\b', r'\b tractatus\b', r'\b commentarii\b',
            r'\b epistola\b', r'\b oratio\b', r'\b sermo\b',
            r'\b dialogus\b', r'\b quaestio\b', r'\b disputatio\b',
            r'\b dissertatio\b', r'\b theses\b'
        ]

        title_lower = title.lower()
        if any(re.search(pattern, title_lower) for pattern in latin_patterns):
            return True

        # Check for Latin endings in first few words
        words = [w.strip('.,:;()[]') for w in title_lower.split()[:6]]
        latin_endings = ('us', 'um', 'a', 'ae', 'is', 'es', 'i', 'o', 'orum', 'arum', 'ibus')
        latin_words = 0

        for word in words:
            if len(word) > 3 and word.endswith(latin_endings):
                # Avoid common non-Latin words
                if word not in ['house', 'library', 'school', 'church', 'catalogue', 'collection']:
                    latin_words += 1

        return latin_words >= 2

    def _clean_record(self, doc):
        """Clean and normalize a record"""
        def clean_field(value):
            if isinstance(value, list):
                return value[0] if value else ''
            return str(value) if value else ''

        # Extract year from date
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

    def save_massive_dataset(self):
        """Save the massive dataset"""
        if not self.records:
            print("❌ No records to save")
            return

        df = pd.DataFrame(self.records)

        # Create timestamped filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/massive_latin_collection_{timestamp}.csv"

        import os
        os.makedirs('data', exist_ok=True)

        df.to_csv(filename, index=False, encoding='utf-8-sig')
        print(f"💾 Saved {len(self.records)} records to {filename}")

        # Quick analysis
        years = [int(r['year']) for r in self.records if r['year'] and r['year'].isdigit()]
        if years:
            print(f"\n📈 Dataset Statistics:")
            print(f"  Total records: {len(self.records)}")
            print(f"  Year range: {min(years)} - {max(years)}")

            # Century distribution
            centuries = {}
            for year in years:
                century = (year // 100) * 100
                centuries[century] = centuries.get(century, 0) + 1

            for century in sorted(centuries.keys()):
                century_name = f"{century}s"
                if century == 1400:
                    century_name = "15th Century"
                elif century == 1500:
                    century_name = "16th Century"
                elif century == 1600:
                    century_name = "17th Century"
                print(f"    {century_name}: {centuries[century]} books")

        return filename

def main():
    collector = MassiveInternetArchiveCollector()

    print("🚀 MASSIVE INTERNET ARCHIVE LATIN COLLECTOR")
    print("=" * 70)

    # First batch: collect 100 pages (10,000 records)
    print("🎯 PHASE 1: Collecting first 10,000 records...")
    collector.search_latin_books_massive(start_page=0, max_pages=100)

    # Save after first batch
    first_file = collector.save_massive_dataset()

    # Second batch: collect another 100 pages
    print(f"\n🎯 PHASE 2: Collecting additional 10,000 records...")
    collector.search_latin_books_massive(start_page=100, max_pages=100)

    # Save complete collection
    final_file = collector.save_massive_dataset()

    print(f"\n🎉 MASSIVE COLLECTION COMPLETE!")
    print(f"📚 Total Latin books collected: {len(collector.records)}")
    print(f"💾 Final dataset: {final_file}")

if __name__ == "__main__":
    main()