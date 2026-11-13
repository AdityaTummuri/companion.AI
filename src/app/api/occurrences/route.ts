import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        mode: 'mock',
        date: dateParam,
        message: 'Supabase offline: occurrences generated via mock store on client',
      });
    }

    const targetDate = new Date(dateParam);
    const dayOfWeek = targetDate.getDay(); // 0-6

    // 1. Get active timetable version
    const { data: activeVersion } = await supabase
      .from('timetable_versions')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!activeVersion) {
      return NextResponse.json(
        { message: 'No active timetable version found' },
        { status: 404 }
      );
    }

    // 2. Fetch timetable entries for this day of week
    const { data: entries, error: entriesErr } = await supabase
      .from('timetable_entries')
      .select('*, subject:subjects(*)')
      .eq('timetable_version_id', activeVersion.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (entriesErr) {
      return NextResponse.json({ error: entriesErr.message }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: true,
        date: dateParam,
        occurrences: [],
        message: 'No classes scheduled for this day',
      });
    }

    // 3. Check for existing occurrences on this date to ensure idempotency
    const { data: existingOccurrences } = await supabase
      .from('class_occurrences')
      .select('*, subject:subjects(*)')
      .eq('scheduled_date', dateParam);

    const existingEntryIds = new Set(
      (existingOccurrences || [])
        .map((o) => o.timetable_entry_id)
        .filter(Boolean)
    );

    // 4. Insert missing occurrences
    const toInsert = entries
      .filter((entry) => !existingEntryIds.has(entry.id))
      .map((entry) => ({
        subject_id: entry.subject_id,
        timetable_entry_id: entry.id,
        scheduled_date: dateParam,
        start_time: entry.start_time,
        end_time: entry.end_time,
        status: 'PENDING',
        notes: entry.room ? `Room: ${entry.room}` : null,
      }));

    if (toInsert.length > 0) {
      await supabase.from('class_occurrences').insert(toInsert);
    }

    // 5. Return all occurrences for this date
    const { data: finalOccurrences } = await supabase
      .from('class_occurrences')
      .select('*, subject:subjects(*)')
      .eq('scheduled_date', dateParam)
      .order('start_time', { ascending: true });

    return NextResponse.json({
      success: true,
      date: dateParam,
      generatedCount: toInsert.length,
      occurrences: finalOccurrences,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
