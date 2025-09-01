import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/database';
import { Appointment } from '@/types';
import * as googleSheets from '@/lib/google-sheets';

// Determina se usare Google Sheets o SQLite
const USE_GOOGLE_SHEETS = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? true : false;

// GET - Ottieni tutti gli appuntamenti
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerPhone = searchParams.get('customerPhone');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      let appointments = await googleSheets.getAppointments(startDate || undefined, endDate || undefined);

      // Filtri lato server per ridurre i dati
      if (date) {
        appointments = appointments.filter(apt => apt.date === date);
      } else if (month) {
        appointments = appointments.filter(apt => apt.date?.startsWith(month));
      } else if (startDate && endDate) {
        appointments = appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
      } else if (startDate) {
        appointments = appointments.filter(apt => apt.date >= startDate);
      } else if (endDate) {
        appointments = appointments.filter(apt => apt.date <= endDate);
      }

      // Filtra per telefono cliente se specificato
      if (customerPhone) {
        appointments = appointments.filter(apt => apt.phone === customerPhone);
      }
      
      return NextResponse.json(appointments);
    }
    
    // Fallback a SQLite (codice esistente)
    // NOTA: nel percorso SQLite usiamo i parametri date/month definiti sopra
    
    let query = `
      SELECT 
        a.*,
        c.first_name,
        c.last_name,
        c.phone
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
    `;
    
    const params: (string | number | null)[] = [];
    let whereClause = '';
    
    if (customerPhone) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' (c.phone = ? OR a.customer_phone = ?)';
      params.push(customerPhone, customerPhone);
    }
    
    if (date) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' a.date = ?';
      params.push(date);
    } else if (month) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' strftime("%Y-%m", a.date) = ?';
      params.push(month);
    } else if (startDate && endDate) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' a.date >= ?';
      params.push(startDate);
    } else if (endDate) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' a.date <= ?';
      params.push(endDate);
    }
    
    query += whereClause;
    query += ' ORDER BY a.date, a.time';
    
    const appointments = await allQuery<Appointment>(query, params);
    
    // Aggiungi nome completo del cliente
    const appointmentsWithCustomer = appointments.map(apt => ({
      ...apt,
      customer_name: apt.first_name && apt.last_name 
        ? `${apt.first_name} ${apt.last_name}` 
        : 'Cliente non specificato'
    }));
    
    return NextResponse.json(appointmentsWithCustomer);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST - Crea nuovo appuntamento
export async function POST(request: NextRequest) {
  try {
    const appointment: Appointment = await request.json();
    
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      const result = await googleSheets.addAppointment({
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
      return NextResponse.json({ ...result, ...appointment });
    }
    
    // Fallback a SQLite (codice esistente)
    const result = await runQuery(
      'INSERT INTO appointments (customer_id, date, time, duration, service, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        appointment.customer_id || null,
        appointment.date,
        appointment.time,
        appointment.duration || 60,
        appointment.service,
        appointment.status || 'scheduled',
        appointment.notes || null
      ]
    );
    
    return NextResponse.json({ id: result.id, ...appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
