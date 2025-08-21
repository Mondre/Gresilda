import { NextRequest, NextResponse } from 'next/server';
import * as googleSheets from '@/lib/google-sheets';
import { allQuery, runQuery } from '@/lib/database';

const USE_GOOGLE_SHEETS = process.env.USE_GOOGLE_SHEETS === 'true' && 
                          process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
                          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
                          process.env.GOOGLE_SHEETS_ID;

// POST - Ricevi richiesta appuntamento dal sito web
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validazione dati richiesti
    const requiredFields = ['nome', 'telefono', 'servizio', 'data_preferita'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          error: `Campo obbligatorio mancante: ${field}` 
        }, { status: 400 });
      }
    }

    // Prepara i dati della richiesta
    const requestData = {
      nome: data.nome,
      cognome: data.cognome || '',
      telefono: data.telefono,
      email: data.email || '',
      servizio: data.servizio,
      data_preferita: data.data_preferita,
      ora_preferita: data.ora_preferita || '',
      note: data.note || '',
      stato: 'DA_CONFERMARE', // Stato speciale per richieste dal sito
      origine: 'SITO_WEB',
      data_richiesta: new Date().toISOString(),
    };

    if (USE_GOOGLE_SHEETS) {
      // Salva in Google Sheets nel foglio "Richieste"
      await googleSheets.addAppointmentRequest(requestData);
    } else {
      // Salva nel database locale
      await runQuery(
        `INSERT INTO appointment_requests 
         (nome, cognome, telefono, email, servizio, data_preferita, ora_preferita, note, stato, origine, data_richiesta) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestData.nome,
          requestData.cognome,
          requestData.telefono,
          requestData.email,
          requestData.servizio,
          requestData.data_preferita,
          requestData.ora_preferita,
          requestData.note,
          requestData.stato,
          requestData.origine,
          requestData.data_richiesta
        ]
      );
    }

    // TODO: Invia notifica (email/telegram) di nuova richiesta

    return NextResponse.json({
      success: true,
      message: 'Richiesta appuntamento ricevuta con successo',
      id: Date.now() // ID temporaneo
    });

  } catch (error) {
    console.error('Error processing appointment request:', error);
    return NextResponse.json({ 
      error: 'Errore durante l\'elaborazione della richiesta' 
    }, { status: 500 });
  }
}

// GET - Ottieni tutte le richieste in sospeso
export async function GET() {
  try {
    if (USE_GOOGLE_SHEETS) {
      const requests = await googleSheets.getAppointmentRequests();
      return NextResponse.json(requests);
    } else {
      const requests = await allQuery(
        'SELECT * FROM appointment_requests WHERE stato = "DA_CONFERMARE" ORDER BY data_richiesta DESC'
      );
      return NextResponse.json(requests);
    }
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
