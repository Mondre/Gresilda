import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/database';
import { Service } from '@/types';

// GET - Ottieni tutti i servizi
export async function GET() {
  try {
    const services = await allQuery<Service>('SELECT * FROM services WHERE active = 1 ORDER BY name');
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
