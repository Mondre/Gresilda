import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/database';
import { Appointment } from '@/types';
import * as googleSheets from '@/lib/google-sheets';

// Determina se usare Google Sheets o SQLite
const USE_GOOGLE_SHEETS = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? true : false;

// GET - Ottieni appuntamento specifico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointment = await getQuery<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

// PUT - Aggiorna appuntamento
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointment: Appointment = await request.json();
    
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      const result = await googleSheets.updateAppointment(parseInt(id), {
        customer_id: appointment.customer_id,
        customer_name: appointment.customer_name,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        duration: appointment.duration || 60,
        status: appointment.status || 'scheduled',
        notes: appointment.notes
      });
      return NextResponse.json({ ...result, id, ...appointment });
    }
    
    // Fallback a SQLite (codice esistente senza price)
    await runQuery(
      'UPDATE appointments SET customer_id = ?, date = ?, time = ?, duration = ?, service = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        appointment.customer_id || null,
        appointment.date,
        appointment.time,
        appointment.duration || 60,
        appointment.service,
        appointment.status || 'scheduled',
        appointment.notes || null,
        id
      ]
    );
    
    return NextResponse.json({ id, ...appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE - Elimina appuntamento
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      const result = await googleSheets.deleteAppointment(parseInt(id));
      return NextResponse.json(result);
    }
    
    // Fallback a SQLite (codice esistente)
    await runQuery('DELETE FROM appointments WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
