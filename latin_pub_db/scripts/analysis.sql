-- analysis.sql - Useful queries for Latin Publications Database
-- Run with: sqlite3 db/latin_publications.db < scripts/analysis.sql

-- ============================================
-- BASIC STATISTICS
-- ============================================

-- Total record count
SELECT '=== Basic Statistics ===' as section;
SELECT 'Total records: ' || COUNT(*) FROM publications;
SELECT 'Records with year: ' || COUNT(*) FROM publications WHERE year IS NOT NULL;
SELECT 'Records with creator: ' || COUNT(*) FROM publications WHERE creator IS NOT NULL;
SELECT 'Year range: ' || MIN(year) || ' - ' || MAX(year) FROM publications WHERE year IS NOT NULL;

-- ============================================
-- TEMPORAL ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Publications by Decade ===' as section;

SELECT
    (year/10)*10 as decade,
    COUNT(*) as publications,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM publications WHERE year IS NOT NULL), 1) as pct
FROM publications
WHERE year IS NOT NULL
GROUP BY decade
ORDER BY decade;

-- Publications by century
SELECT '';
SELECT '=== Publications by Century ===' as section;

SELECT
    CASE
        WHEN year < 1500 THEN '15th century'
        WHEN year < 1600 THEN '16th century'
        WHEN year < 1700 THEN '17th century'
        WHEN year < 1800 THEN '18th century'
        ELSE '19th century'
    END as century,
    COUNT(*) as publications
FROM publications
WHERE year IS NOT NULL
GROUP BY century
ORDER BY MIN(year);

-- ============================================
-- GEOGRAPHIC/PUBLISHER ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Top 20 Publishers/Places ===' as section;

SELECT
    publisher,
    COUNT(*) as publications
FROM publications
WHERE publisher IS NOT NULL
GROUP BY publisher
ORDER BY publications DESC
LIMIT 20;

-- ============================================
-- AUTHOR ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Top 50 Authors ===' as section;

SELECT
    creator,
    creator_normalized,
    COUNT(*) as works
FROM publications
WHERE creator IS NOT NULL
GROUP BY creator_normalized
ORDER BY works DESC
LIMIT 50;

-- Search for specific author (example: Cicero)
SELECT '';
SELECT '=== Works by Cicero ===' as section;

SELECT
    title,
    year,
    publisher,
    ia_identifier
FROM publications
WHERE creator_normalized LIKE '%cicero%'
ORDER BY year
LIMIT 20;

-- ============================================
-- COLLECTION ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Collection Coverage ===' as section;

SELECT
    collection,
    COUNT(*) as items
FROM publications
WHERE collection IS NOT NULL
GROUP BY collection
ORDER BY items DESC
LIMIT 20;

-- ============================================
-- DEDUPLICATION ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Deduplication Statistics ===' as section;

SELECT 'Total records: ' || COUNT(*) FROM publications;

SELECT 'Records in duplicate clusters: ' || COUNT(*)
FROM publications
WHERE canonical_id IS NOT NULL;

SELECT 'Unique works (after dedup): ' || COUNT(*)
FROM publications
WHERE canonical_id IS NULL OR canonical_id = id;

SELECT 'Duplicate clusters: ' || COUNT(DISTINCT canonical_id)
FROM publications
WHERE canonical_id IS NOT NULL;

-- Largest duplicate clusters
SELECT '';
SELECT '=== Largest Duplicate Clusters ===' as section;

SELECT
    canonical_id,
    COUNT(*) as copies,
    MIN(title) as sample_title,
    MIN(year) as earliest_year
FROM publications
WHERE canonical_id IS NOT NULL
GROUP BY canonical_id
HAVING COUNT(*) > 2
ORDER BY copies DESC
LIMIT 10;

-- ============================================
-- SUBJECT ANALYSIS
-- ============================================

SELECT '';
SELECT '=== Common Subjects ===' as section;

SELECT
    subject,
    COUNT(*) as works
FROM publications
WHERE subject IS NOT NULL
GROUP BY subject
ORDER BY works DESC
LIMIT 20;

-- ============================================
-- SAMPLE RECORDS
-- ============================================

SELECT '';
SELECT '=== Sample Records (10 random) ===' as section;

SELECT
    ia_identifier,
    title,
    creator,
    year,
    publisher
FROM publications
ORDER BY RANDOM()
LIMIT 10;

-- ============================================
-- DATA QUALITY
-- ============================================

SELECT '';
SELECT '=== Data Quality ===' as section;

SELECT 'Missing title: ' || COUNT(*) FROM publications WHERE title IS NULL;
SELECT 'Missing creator: ' || COUNT(*) FROM publications WHERE creator IS NULL;
SELECT 'Missing year: ' || COUNT(*) FROM publications WHERE year IS NULL;
SELECT 'Missing publisher: ' || COUNT(*) FROM publications WHERE publisher IS NULL;

-- Year parsing failures (has date_string but no year)
SELECT 'Unparsed dates: ' || COUNT(*)
FROM publications
WHERE date_string IS NOT NULL AND year IS NULL;

-- Sample of unparsed dates
SELECT '';
SELECT '=== Sample Unparsed Dates ===' as section;

SELECT date_string, COUNT(*) as occurrences
FROM publications
WHERE date_string IS NOT NULL AND year IS NULL
GROUP BY date_string
ORDER BY occurrences DESC
LIMIT 10;
