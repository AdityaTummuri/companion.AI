import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AttendanceStatus } from '@/lib/types';

const VALID_STATUSES: AttendanceStatus[] = [
  'PRESENT',
  'ABSENT',
  'CANCELLED',
  'RESCHEDULED',
  'PENDING',
  'NOT_APPLICABLE',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { occurrenceId, status, correctionReason, userId } = body;

    if (!occurrenceId || !status) {
      return NextResponse.json(
        { error: 'Missing occurrenceId or status' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Must be one of ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      // In offline/mock mode, return simulated success
      return NextResponse.json({
        success: true,
        mode: 'mock',
        message: 'Attendance recorded in offline mode',
        data: {
          occurrenceId,
          status,
          correctionReason,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // 1. Fetch current occurrence to inspect old status
    const { data: currentOcc, error: fetchErr } = await supabase
      .from('class_occurrences')
      .select('*, subject:subjects(*)')
      .eq('id', occurrenceId)
      .single();

    if (fetchErr || !currentOcc) {
      return NextResponse.json(
        { error: 'Class occurrence not found', details: fetchErr },
        { status: 404 }
      );
    }

    const oldStatus = currentOcc.status;
    const isCorrection = oldStatus !== 'PENDING' && oldStatus !== status;

    // 2. Update class_occurrence status
    const { error: updateErr } = await supabase
      .from('class_occurrences')
      .update({
        status,
        notes: correctionReason ? `${currentOcc.notes ? currentOcc.notes + ' | ' : ''}Correction: ${correctionReason}` : currentOcc.notes,
      })
      .eq('id', occurrenceId);

    if (updateErr) {
      return NextResponse.json(
        { error: 'Failed to update occurrence', details: updateErr },
        { status: 500 }
      );
    }

    // 3. Upsert attendance_record
    const { data: record, error: recordErr } = await supabase
      .from('attendance_records')
      .upsert(
        {
          class_occurrence_id: occurrenceId,
          subject_id: currentOcc.subject_id,
          attendance_status: status,
          updated_at: new Date().toISOString(),
          correction_reason: correctionReason || null,
        },
        { onConflict: 'class_occurrence_id' }
      )
      .select()
      .single();

    if (recordErr) {
      return NextResponse.json(
        { error: 'Failed to save attendance record', details: recordErr },
        { status: 500 }
      );
    }

    // 4. Log to audit_log
    const effectiveUserId = userId || currentOcc.subject?.user_id;
    if (effectiveUserId) {
      await supabase.from('audit_log').insert({
        user_id: effectiveUserId,
        entity_type: 'class_occurrence',
        entity_id: occurrenceId,
        action: isCorrection ? 'CORRECTION' : 'UPDATE',
        old_value: { status: oldStatus },
        new_value: { status, correction_reason: correctionReason || null },
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'live',
      isCorrection,
      record,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
