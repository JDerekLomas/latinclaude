import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * USTC Random Sample API
 *
 * Get random samples from the enriched USTC dataset.
 * Useful for exploration, testing, or generating diverse samples.
 *
 * Query Parameters:
 * - count: Number of random records (default: 10, max: 100)
 * - language: Optional language filter
 * - work_type: Optional work type filter
 * - subject: Optional subject tag filter
 *
 * Example: /api/ustc/random?count=20&language=Latin
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const count = Math.min(parseInt(searchParams.get('count') || '10'), 100);
  const language = searchParams.get('language') || '';
  const workType = searchParams.get('work_type') || '';
  const subject = searchParams.get('subject') || '';

  try {
    // Get total count for random offset calculation
    let countQuery = supabase
      .from('ustc_enrichments')
      .select('*', { count: 'exact', head: true });

    if (language) {
      countQuery = countQuery.ilike('detected_language', `%${language}%`);
    }
    if (workType) {
      countQuery = countQuery.eq('work_type', workType);
    }
    if (subject) {
      countQuery = countQuery.contains('subject_tags', [subject]);
    }

    const { count: totalCount } = await countQuery;

    if (!totalCount || totalCount === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    // Generate random offset
    const maxOffset = Math.max(0, totalCount - count);
    const randomOffset = Math.floor(Math.random() * maxOffset);

    // Fetch random records
    let query = supabase
      .from('ustc_enrichments')
      .select('*');

    if (language) {
      query = query.ilike('detected_language', `%${language}%`);
    }
    if (workType) {
      query = query.eq('work_type', workType);
    }
    if (subject) {
      query = query.contains('subject_tags', [subject]);
    }

    query = query.range(randomOffset, randomOffset + count - 1);

    const { data, error } = await query;

    if (error) {
      console.error('USTC random error:', error);
      return NextResponse.json({ error: 'Failed to fetch random samples' }, { status: 500 });
    }

    // Shuffle the results for extra randomness
    const shuffled = (data || []).sort(() => Math.random() - 0.5);

    return NextResponse.json({
      items: shuffled,
      count: shuffled.length,
      total_available: totalCount
    });
  } catch (err) {
    console.error('USTC random error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
