import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * USTC Enrichments Statistics API
 *
 * Returns aggregate statistics about the enriched USTC dataset:
 * - Total records
 * - Language distribution
 * - Work type distribution
 * - Religious tradition distribution
 * - Top subject tags
 * - Top original authors (for derivative works)
 */
export async function GET() {
  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('ustc_enrichments')
      .select('*', { count: 'exact', head: true });

    // Get language distribution (top 20)
    const { data: languages } = await supabase
      .from('ustc_enrichments')
      .select('detected_language')
      .not('detected_language', 'is', null)
      .not('detected_language', 'eq', '');

    const languageCounts: Record<string, number> = {};
    languages?.forEach(row => {
      const lang = row.detected_language;
      if (lang) {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      }
    });
    const languageDistribution = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([language, count]) => ({ language, count }));

    // Get work type distribution
    const { data: workTypes } = await supabase
      .from('ustc_enrichments')
      .select('work_type')
      .not('work_type', 'is', null)
      .not('work_type', 'eq', '');

    const workTypeCounts: Record<string, number> = {};
    workTypes?.forEach(row => {
      const wt = row.work_type;
      if (wt) {
        workTypeCounts[wt] = (workTypeCounts[wt] || 0) + 1;
      }
    });
    const workTypeDistribution = Object.entries(workTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([work_type, count]) => ({ work_type, count }));

    // Get religious tradition distribution
    const { data: religions } = await supabase
      .from('ustc_enrichments')
      .select('religious_tradition')
      .not('religious_tradition', 'is', null)
      .not('religious_tradition', 'eq', '')
      .not('religious_tradition', 'eq', 'null');

    const religionCounts: Record<string, number> = {};
    religions?.forEach(row => {
      const rt = row.religious_tradition;
      if (rt && rt !== 'null') {
        religionCounts[rt] = (religionCounts[rt] || 0) + 1;
      }
    });
    const religiousDistribution = Object.entries(religionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tradition, count]) => ({ tradition, count }));

    // Get top original authors (for derivative works)
    const { data: authors } = await supabase
      .from('ustc_enrichments')
      .select('original_author')
      .not('original_author', 'is', null)
      .not('original_author', 'eq', '')
      .not('original_author', 'eq', 'null');

    const authorCounts: Record<string, number> = {};
    authors?.forEach(row => {
      const author = row.original_author;
      if (author && author !== 'null') {
        authorCounts[author] = (authorCounts[author] || 0) + 1;
      }
    });
    const topOriginalAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([author, count]) => ({ author, count }));

    return NextResponse.json({
      total_records: totalCount || 0,
      language_distribution: languageDistribution,
      work_type_distribution: workTypeDistribution,
      religious_distribution: religiousDistribution,
      top_original_authors: topOriginalAuthors,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('USTC stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
