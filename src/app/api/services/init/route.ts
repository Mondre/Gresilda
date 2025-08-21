import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/database';

// POST - Inizializza/aggiorna servizi nel database
export async function POST() {
  try {
    // Aggiungi i nuovi servizi se non esistono già
    const services = [
      { id: 4, name: 'Cerimonia', description: 'Acconciatura per cerimonie ed eventi', duration: 90, price: 50.00 },
      { id: 5, name: 'Trucco', description: 'Make-up professionale', duration: 45, price: 30.00 }
    ];

    for (const service of services) {
      await runQuery(
        'INSERT OR IGNORE INTO services (id, name, description, duration, price, active) VALUES (?, ?, ?, ?, ?, ?)',
        [service.id, service.name, service.description, service.duration, service.price, 1]
      );
    }

    return NextResponse.json({ 
      message: 'Services updated successfully',
      added: services.length 
    });
  } catch (error) {
    console.error('Error updating services:', error);
    return NextResponse.json({ error: 'Failed to update services' }, { status: 500 });
  }
}
