import { NextRequest, NextResponse } from 'next/server';
import * as googleSheets from '@/lib/google-sheets';
import { runQuery } from '@/lib/database';

const USE_GOOGLE_SHEETS = process.env.USE_GOOGLE_SHEETS === 'true' && 
                          process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
                          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
                          process.env.GOOGLE_SHEETS_ID;

// PUT - Aggiorna stato richiesta appuntamento
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, notes } = await request.json();
    
    let newStatus = '';
    switch (action) {
      case 'confirm':
        newStatus = 'CONFERMATO';
        break;
      case 'reject':
        newStatus = 'RIFIUTATO';
        break;
      case 'called':
        newStatus = 'CHIAMATO';
        break;
      default:
        return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
    }

    if (USE_GOOGLE_SHEETS) {
      await googleSheets.updateAppointmentRequestStatus(parseInt(id), newStatus, notes);
    } else {
      await runQuery(
        'UPDATE appointment_requests SET stato = ?, note_interne = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, notes || null, id]
      );
    }

    // Se confermato, crea automaticamente l'appuntamento
    if (action === 'confirm') {
      // Prima recupera i dati della richiesta
      let requestData;
      if (USE_GOOGLE_SHEETS) {
        const requests = await googleSheets.getAppointmentRequests();
        requestData = requests.find(r => r.id === parseInt(id));
      } else {
        const result = await runQuery(
          'SELECT * FROM appointment_requests WHERE id = ?',
          [id]
        );
        requestData = result[0];
      }

      if (requestData) {
        // Controlla/crea il cliente (solo Google Sheets per ora)
        if (USE_GOOGLE_SHEETS) {
          const customers = await googleSheets.getCustomers();
          const existingCustomer = customers.find(c => 
            c.phone === requestData.telefono || 
            (c.email && requestData.email && c.email.toLowerCase() === requestData.email.toLowerCase())
          );

          if (!existingCustomer) {
            // Crea nuovo cliente
            const newCustomer = {
              first_name: requestData.nome,
              last_name: requestData.cognome || '',
              phone: requestData.telefono,
              email: requestData.email || '',
              birthday: '',
              notes: `Cliente creato da richiesta web del ${new Date().toLocaleDateString('it-IT')}`
            };
            await googleSheets.addCustomer(newCustomer);
          }

          // Crea l'appuntamento nel sistema
          const appointmentData = {
            customer_name: `${requestData.nome} ${requestData.cognome || ''}`.trim(),
            phone: requestData.telefono,
            date: requestData.data_preferita,
            time: requestData.ora_preferita || '09:00',
            service: requestData.servizio,
            status: 'scheduled' as const,
            notes: `${requestData.note ? requestData.note + ' - ' : ''}Appuntamento creato da richiesta web`
          };

          await googleSheets.addAppointment(appointmentData);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'confirm' 
        ? 'Richiesta confermata e appuntamento creato con successo!' 
        : action === 'reject' 
          ? 'Richiesta rifiutata' 
          : 'Richiesta segnata come chiamata'
    });

  } catch (error) {
    console.error('Error updating appointment request:', error);
    return NextResponse.json({ 
      error: 'Errore durante l\'aggiornamento della richiesta' 
    }, { status: 500 });
  }
}

// DELETE - Elimina richiesta appuntamento
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (USE_GOOGLE_SHEETS) {
      await googleSheets.deleteAppointmentRequest(parseInt(id));
    } else {
      await runQuery('DELETE FROM appointment_requests WHERE id = ?', [id]);
    }

    return NextResponse.json({ message: 'Richiesta eliminata con successo' });
  } catch (error) {
    console.error('Error deleting appointment request:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
