#!/bin/bash
# harvest.sh - Download Latin publication metadata from Internet Archive
# Usage: ./harvest.sh [--resume]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
METADATA_DIR="$BASE_DIR/metadata"
LISTS_DIR="$BASE_DIR/item_lists"

mkdir -p "$METADATA_DIR" "$LISTS_DIR"

echo "=== Latin Publications Harvester ==="
echo "Base directory: $BASE_DIR"
echo ""

# Check if ia CLI is available
if ! command -v ia &> /dev/null; then
    echo "Error: 'ia' CLI not found. Install with: pip install internetarchive"
    exit 1
fi

# Function to search with retry
search_with_retry() {
    local query="$1"
    local output="$2"
    local max_retries=3
    local retry=0

    while [ $retry -lt $max_retries ]; do
        echo "  Searching: $query"
        if ia search "$query" --itemlist > "$output" 2>/dev/null; then
            local count=$(wc -l < "$output")
            echo "  Found: $count items"
            return 0
        fi
        retry=$((retry + 1))
        echo "  Retry $retry/$max_retries..."
        sleep $((retry * 2))
    done

    echo "  Warning: Search failed after $max_retries retries"
    touch "$output"
    return 1
}

# Phase 1: Get item lists by century
echo "Phase 1: Fetching item lists by century..."
echo ""

search_with_retry 'language:lat AND date:[1450 TO 1499]' "$LISTS_DIR/items_15c_early.txt"
search_with_retry 'language:lat AND date:[1500 TO 1599]' "$LISTS_DIR/items_16c.txt"
search_with_retry 'language:lat AND date:[1600 TO 1699]' "$LISTS_DIR/items_17c.txt"
search_with_retry 'language:lat AND date:[1700 TO 1799]' "$LISTS_DIR/items_18c.txt"
search_with_retry 'language:lat AND date:[1800 TO 1900]' "$LISTS_DIR/items_19c.txt"

# Combine and deduplicate
echo ""
echo "Combining item lists..."
cat "$LISTS_DIR"/items_*.txt | sort -u > "$LISTS_DIR/all_items.txt"
TOTAL_ITEMS=$(wc -l < "$LISTS_DIR/all_items.txt")
echo "Total unique items: $TOTAL_ITEMS"

# Phase 2: Download metadata
echo ""
echo "Phase 2: Downloading metadata..."
echo ""

DOWNLOADED=0
SKIPPED=0
FAILED=0

while IFS= read -r id; do
    if [ -z "$id" ]; then
        continue
    fi

    OUTPUT_FILE="$METADATA_DIR/${id}.json"

    if [ -f "$OUTPUT_FILE" ]; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Rate limit: 0.1 second between requests
    sleep 0.1

    if ia metadata "$id" > "$OUTPUT_FILE" 2>/dev/null; then
        DOWNLOADED=$((DOWNLOADED + 1))

        # Progress every 100 items
        if [ $((DOWNLOADED % 100)) -eq 0 ]; then
            echo "  Downloaded: $DOWNLOADED | Skipped: $SKIPPED | Failed: $FAILED"
        fi
    else
        rm -f "$OUTPUT_FILE"
        FAILED=$((FAILED + 1))
        echo "  Failed: $id"
    fi

done < "$LISTS_DIR/all_items.txt"

echo ""
echo "=== Harvest Complete ==="
echo "Downloaded: $DOWNLOADED"
echo "Skipped (already exists): $SKIPPED"
echo "Failed: $FAILED"
echo "Metadata stored in: $METADATA_DIR"
