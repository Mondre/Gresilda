// API route per la gestione Google Sheets
import { NextRequest, NextResponse } from 'next/server';
import * as googleSheets from '../../../lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'customers':
        const customers = await googleSheets.getCustomers();
        return NextResponse.json(customers);
        
      case 'appointments':
        const appointments = await googleSheets.getAppointments(startDate || undefined, endDate || undefined);
        return NextResponse.json(appointments);
        
      case 'products':
        const products = await googleSheets.getProducts();
        return NextResponse.json(products);
        
      case 'initialize':
        const result = await googleSheets.initializeGoogleSheet();
        return NextResponse.json(result);
        
      default:
        return NextResponse.json({ error: 'Action not specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento dei dati da Google Sheets' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'customer':
        const customerResult = await googleSheets.addCustomer(body);
        return NextResponse.json(customerResult);
        
      case 'appointment':
        const appointmentResult = await googleSheets.addAppointment(body);
        return NextResponse.json(appointmentResult);
        
      case 'product':
        const productResult = await googleSheets.addProduct(body);
        return NextResponse.json(productResult);
        
      default:
        return NextResponse.json({ error: 'Action not specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiunta dei dati a Google Sheets' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
    }

    switch (action) {
      case 'customer':
        const customerResult = await googleSheets.updateCustomer(id, body);
        return NextResponse.json(customerResult);
        
      case 'appointment':
        const appointmentResult = await googleSheets.updateAppointment(id, body);
        return NextResponse.json(appointmentResult);
        
      default:
        return NextResponse.json({ error: 'Action not specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dei dati in Google Sheets' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = parseInt(searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
    }

    switch (action) {
      case 'appointment':
        const result = await googleSheets.deleteAppointment(id);
        return NextResponse.json(result);
        
      default:
        return NextResponse.json({ error: 'Delete action not supported for this resource' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dei dati da Google Sheets' }, 
      { status: 500 }
    );
  }
}
