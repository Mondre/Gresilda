import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/database';
import { Customer } from '@/types';
import * as googleSheets from '@/lib/google-sheets';

// Determina se usare Google Sheets o SQLite
const USE_GOOGLE_SHEETS = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? true : false;

// GET - Ottieni tutti i clienti
export async function GET() {
  try {
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      const customers = await googleSheets.getCustomers();
      return NextResponse.json(customers);
    }
    
    // Fallback a SQLite (codice esistente)
    const customers = await allQuery<Customer>('SELECT * FROM customers ORDER BY last_name, first_name');
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST - Crea nuovo cliente
export async function POST(request: NextRequest) {
  try {
    const customer: Customer = await request.json();
    
    // Usa Google Sheets se configurato, altrimenti SQLite
    if (USE_GOOGLE_SHEETS) {
      const result = await googleSheets.addCustomer({
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone || '',
        birthday: customer.birthday || '',
        notes: customer.notes || ''
      });
      return NextResponse.json({ ...result, ...customer });
    }
    
    // Fallback a SQLite (codice esistente)
    const result = await runQuery(
      'INSERT INTO customers (first_name, last_name, phone, birthday, notes) VALUES (?, ?, ?, ?, ?)',
      [customer.first_name, customer.last_name, customer.phone || null, customer.birthday || null, customer.notes || null]
    );
    
    return NextResponse.json({ id: result.id, ...customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
