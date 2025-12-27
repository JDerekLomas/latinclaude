import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * USTC Enrichments Search API
 *
 * Search enriched Renaissance book metadata (1450-1700)
 *
 * Query Parameters:
 * - q: Full-text search on title (both original and English)
 * - language: Filter by detected language (Latin, French, German, etc.)
 * - work_type: Filter by work type (original, commentary, translation, treatise, etc.)
 * - subject: Filter by subject tag (theology, astronomy, medicine, etc.)
 * - religious_tradition: Filter by religious tradition (Catholic, Protestant, Lutheran, etc.)
 * - original_author: Filter by original author (Aristotle, Cicero, Augustine, etc.)
 * - classical_source: Filter by classical source work
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 500)
 *
 * Example: /api/ustc/search?q=aristotle&language=Latin&limit=100
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const q = searchParams.get('q') || '';
  const language = searchParams.get('language') || '';
  const workType = searchParams.get('work_type') || '';
  const subject = searchParams.get('subject') || '';
  const religiousTradition = searchParams.get('religious_tradition') || '';
  const originalAuthor = searchParams.get('original_author') || '';
  const classicalSource = searchParams.get('classical_source') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('ustc_enrichments')
      .select('*', { count: 'exact' });

    // Full-text search on titles
    if (q) {
      query = query.or(`std_title.ilike.%${q}%,english_title.ilike.%${q}%`);
    }

    // Language filter
    if (language) {
      query = query.ilike('detected_language', `%${language}%`);
    }

    // Work type filter
    if (workType) {
      query = query.eq('work_type', workType);
    }

    // Subject tag filter (searches within JSONB array)
    if (subject) {
      query = query.contains('subject_tags', [subject]);
    }

    // Religious tradition filter
    if (religiousTradition) {
      query = query.eq('religious_tradition', religiousTradition);
    }

    // Original author filter (for commentaries, translations, editions)
    if (originalAuthor) {
      query = query.ilike('original_author', `%${originalAuthor}%`);
    }

    // Classical source filter
    if (classicalSource) {
      query = query.ilike('classical_source', `%${classicalSource}%`);
    }

    // Paginate
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('USTC search error:', error);
      return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    });
  } catch (err) {
    console.error('USTC search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
