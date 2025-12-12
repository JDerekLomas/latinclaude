#!/usr/bin/env python3
"""
Scrape translation series catalogues to build database of Latin-English translations.

This is a starter script - each series will need custom handling.
"""

import json
import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
from typing import Optional
import time
import re

@dataclass
class Translation:
    series: str
    title: str
    author: str
    translator: Optional[str] = None
    year_published: Optional[int] = None
    original_latin_title: Optional[str] = None
    isbn: Optional[str] = None
    url: Optional[str] = None
    notes: Optional[str] = None

# Series to scrape with their catalogue URLs
SERIES_SOURCES = {
    "loeb": {
        "name": "Loeb Classical Library",
        "url": "https://www.loebclassics.com/browse?t1=702", # Latin volumes
        "type": "paginated_catalogue"
    },
    "itatti": {
        "name": "I Tatti Renaissance Library",
        "url": "https://www.hup.harvard.edu/series/the-i-tatti-renaissance-library",
        "type": "series_page"
    },
    "doml": {
        "name": "Dumbarton Oaks Medieval Library",
        "url": "https://www.hup.harvard.edu/series/dumbarton-oaks-medieval-library",
        "type": "series_page"
    },
    "omt": {
        "name": "Oxford Medieval Texts",
        "url": "https://global.oup.com/academic/content/series/o/oxford-medieval-texts-omt/",
        "type": "oup_series"
    },
    "penguin_latin": {
        "name": "Penguin Classics (Latin)",
        "url": "https://www.penguin.co.uk/penguin-classics/classics-list?language=latin",
        "type": "penguin_filter"
    },
    "aris_phillips": {
        "name": "Aris & Phillips Classical Texts",
        "url": "https://www.liverpooluniversitypress.co.uk/topic/book-series/aris-and-phillips-classical-texts",
        "type": "lup_series"
    },
    "fotc": {
        "name": "Fathers of the Church",
        "url": "https://www.cuapress.org/series/",
        "type": "cua_series"
    },
    "acw": {
        "name": "Ancient Christian Writers",
        "url": "https://www.paulistpress.com/Products/CategoryCenter/PTRL!ACHW/ancient-christian-writers-series.aspx",
        "type": "paulist_series"
    },
    "tmlt": {
        "name": "Toronto Medieval Latin Texts",
        "url": "https://www.brepols.net/series/TMLT",
        "type": "brepols_series"
    },
    "tth": {
        "name": "Translated Texts for Historians",
        "url": "https://www.liverpooluniversitypress.co.uk/topic/book-series/translated-texts-for-historians",
        "type": "lup_series"
    },
}

def get_page(url: str, delay: float = 1.0) -> Optional[BeautifulSoup]:
    """Fetch a page with rate limiting and error handling."""
    try:
        time.sleep(delay)  # Be polite
        headers = {
            'User-Agent': 'Mozilla/5.0 (research project - building translation database)'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_hup_series(series_key: str, info: dict) -> list[Translation]:
    """Scrape Harvard University Press series pages (I Tatti, DOML)."""
    translations = []
    soup = get_page(info['url'])
    if not soup:
        return translations

    # HUP series pages typically list books in a grid
    # This is a template - actual selectors need verification
    book_items = soup.select('.book-item, .product-item, article')

    for item in book_items:
        title_elem = item.select_one('h2, h3, .title')
        author_elem = item.select_one('.author, .contributor')
        link_elem = item.select_one('a[href]')

        if title_elem:
            translations.append(Translation(
                series=info['name'],
                title=title_elem.get_text(strip=True),
                author=author_elem.get_text(strip=True) if author_elem else "Unknown",
                url=link_elem['href'] if link_elem else None
            ))

    return translations

def scrape_loeb(info: dict) -> list[Translation]:
    """Scrape Loeb Classical Library Latin volumes."""
    translations = []
    # Loeb has a paginated catalogue - would need to handle pagination
    # and potentially JavaScript rendering

    # For now, return empty - would need Selenium or API access
    print("Loeb scraping requires JavaScript rendering - skipping")
    return translations

def scrape_perseus() -> list[Translation]:
    """Get Latin texts from Perseus Digital Library."""
    translations = []

    # Perseus has a catalogue API
    catalog_url = "https://scaife.perseus.org/library/"
    # Would need to filter for Latin texts with translations

    print("Perseus scraping requires API exploration - skipping")
    return translations

def main():
    """Main scraping routine."""
    all_translations = []

    for series_key, info in SERIES_SOURCES.items():
        print(f"\nScraping: {info['name']}")

        if info['type'] == 'series_page' and 'hup.harvard.edu' in info['url']:
            translations = scrape_hup_series(series_key, info)
        elif series_key == 'loeb':
            translations = scrape_loeb(info)
        else:
            print(f"  No scraper implemented for type: {info['type']}")
            translations = []

        print(f"  Found: {len(translations)} titles")
        all_translations.extend(translations)

    # Add Perseus
    print("\nScraping: Perseus Digital Library")
    perseus_translations = scrape_perseus()
    all_translations.extend(perseus_translations)

    # Save results
    output = {
        "metadata": {
            "description": "Latin-English translation database",
            "sources": list(SERIES_SOURCES.keys()) + ["perseus"],
            "total_count": len(all_translations)
        },
        "translations": [asdict(t) for t in all_translations]
    }

    with open('data/translations_database.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n\nTotal translations found: {len(all_translations)}")
    print("Saved to: data/translations_database.json")

if __name__ == "__main__":
    main()
