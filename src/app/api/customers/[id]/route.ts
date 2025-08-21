import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/database';
import { Customer } from '@/types';

// GET - Ottieni cliente specifico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await getQuery<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

// PUT - Aggiorna cliente
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer: Customer = await request.json();
    
    await runQuery(
      'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, birthday = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [customer.first_name, customer.last_name, customer.phone || null, customer.birthday || null, customer.notes || null, id]
    );
    
    return NextResponse.json({ id, ...customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE - Elimina cliente
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await runQuery('DELETE FROM customers WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
