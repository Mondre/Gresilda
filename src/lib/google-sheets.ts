import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// Tipi per i dati
interface CustomerData {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  birthday?: string;
  notes?: string;
}

interface AppointmentData {
  customer_id?: number;
  customer_name?: string;
  phone?: string;
  date: string;
  time: string;
  service: string;
  duration?: number;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

interface ProductData {
  name: string;
  brand?: string;
  category?: string;
  quantity?: number;
  min_quantity?: number;
  price_purchase?: number;
  price_sale?: number;
  expiration_date?: string;
  notes?: string;
}

interface AppointmentRequestData {
  nome: string;
  cognome?: string;
  telefono: string;
  email?: string;
  servizio: string;
  data_preferita: string;
  ora_preferita?: string;
  note?: string;
  stato: string;
  origine: string;
  data_richiesta: string;
}

// Configurazione Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Credenziali per Service Account (verranno aggiunte in .env)
const credentials = {
  client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Inizializza l'autenticazione Google
export async function getGoogleSheetsService() {
  const auth = new GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Utility per convertire indici in notazione A1
export function columnToLetter(column: number): string {
  let temp;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

// Utility per ottenere il range A1
export function getA1Range(sheet: string, startRow: number, endRow?: number, startCol?: number, endCol?: number): string {
  let range = sheet + '!';
  const startColLetter = startCol ? columnToLetter(startCol) : 'A';
  const endColLetter = endCol ? columnToLetter(endCol) : '';
  
  if (endRow && endColLetter) {
    range += `${startColLetter}${startRow}:${endColLetter}${endRow}`;
  } else if (endRow) {
    range += `${startColLetter}${startRow}:${startRow === endRow ? startRow : endRow}`;
  } else {
    range += `${startColLetter}${startRow}:${startRow}`;
  }
  
  return range;
}

// Servizi specifici per le nostre tabelle

// CLIENTI
export async function getCustomers() {
  try {
    const sheets = await getGoogleSheetsService();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Clienti!A2:F', // Skip header row
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      id: index + 1,
      first_name: row[0] || '',
      last_name: row[1] || '',
      phone: row[2] || '',
      email: row[3] || '',
      birthday: row[4] || '',
      notes: row[5] || '',
    }));
  } catch (error) {
    console.error('Error fetching customers from Google Sheets:', error);
    throw new Error('Errore nel caricamento dei clienti da Google Sheets');
  }
}

export async function addCustomer(customerData: CustomerData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const values = [[
      customerData.first_name,
      customerData.last_name,
      customerData.phone,
      customerData.email || '',
      customerData.birthday || '',
      customerData.notes || '',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Clienti!A2:F',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Cliente aggiunto con successo' };
  } catch (error) {
    console.error('Error adding customer to Google Sheets:', error);
    throw new Error('Errore nell\'aggiunta del cliente');
  }
}

export async function updateCustomer(id: number, customerData: CustomerData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const values = [[
      customerData.first_name,
      customerData.last_name,
      customerData.phone,
      customerData.email || '',
      customerData.birthday || '',
      customerData.notes || '',
    ]];

    const row = id + 1; // +1 perché riga 1 è header
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Clienti!A${row}:F${row}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Cliente aggiornato con successo' };
  } catch (error) {
    console.error('Error updating customer in Google Sheets:', error);
    throw new Error('Errore nell\'aggiornamento del cliente');
  }
}

// APPUNTAMENTI
export async function getAppointments(startDate?: string, endDate?: string) {
  try {
    const sheets = await getGoogleSheetsService();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Appuntamenti!A2:I', // Skip header row
    });

    const rows = response.data.values || [];
    let appointments = rows.map((row, index) => ({
      id: index + 1,
      customer_id: parseInt(row[0]) || 0,
      customer_name: row[1] || '',
      phone: row[2] || '',
      date: row[3] || '',
      time: row[4] || '',
      service: row[5] || '',
      duration: parseInt(row[6]) || 60,
      status: row[7] || 'scheduled',
      notes: row[8] || '',
    }));

    // Filtra per date se specificato
    if (startDate && endDate) {
      appointments = appointments.filter(apt => {
        return apt.date >= startDate && apt.date <= endDate;
      });
    }

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments from Google Sheets:', error);
    throw new Error('Errore nel caricamento degli appuntamenti da Google Sheets');
  }
}

export async function addAppointment(appointmentData: AppointmentData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Ottieni il nome del cliente se c'è customer_id
    let customerName = '';
    let customerPhone = '';
    
    if (appointmentData.customer_id) {
      const customers = await getCustomers();
      const customer = customers.find(c => c.id === appointmentData.customer_id);
      if (customer) {
        customerName = `${customer.first_name} ${customer.last_name}`;
        customerPhone = customer.phone;
      }
    }

    const values = [[
      appointmentData.customer_id || '',
      appointmentData.customer_name || customerName,
      appointmentData.phone || customerPhone,
      appointmentData.date,
      appointmentData.time,
      appointmentData.service,
      appointmentData.duration || 60,
      appointmentData.status || 'scheduled',
      appointmentData.notes || '',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Appuntamenti!A2:I',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Appuntamento aggiunto con successo' };
  } catch (error) {
    console.error('Error adding appointment to Google Sheets:', error);
    throw new Error('Errore nell\'aggiunta dell\'appuntamento');
  }
}

export async function updateAppointment(id: number, appointmentData: AppointmentData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Ottieni il nome del cliente se c'è customer_id
    let customerName = appointmentData.customer_name || '';
    let customerPhone = appointmentData.phone || '';
    
    if (appointmentData.customer_id) {
      const customers = await getCustomers();
      const customer = customers.find(c => c.id === appointmentData.customer_id);
      if (customer) {
        customerName = `${customer.first_name} ${customer.last_name}`;
        customerPhone = customer.phone;
      }
    }
    
    const values = [[
      appointmentData.customer_id || '',
      customerName,
      customerPhone,
      appointmentData.date,
      appointmentData.time,
      appointmentData.service,
      appointmentData.duration || 60,
      appointmentData.status || 'scheduled',
      appointmentData.notes || '',
    ]];

    const row = id + 1; // +1 perché riga 1 è header
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Appuntamenti!A${row}:I${row}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Appuntamento aggiornato con successo' };
  } catch (error) {
    console.error('Error updating appointment in Google Sheets:', error);
    throw new Error('Errore nell\'aggiornamento dell\'appuntamento');
  }
}

export async function deleteAppointment(id: number) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const row = id + 1; // +1 perché riga 1 è header
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // ID del foglio "Appuntamenti" (0 per il primo foglio)
              dimension: 'ROWS',
              startIndex: row - 1,
              endIndex: row,
            },
          },
        }],
      },
    });

    return { success: true, message: 'Appuntamento eliminato con successo' };
  } catch (error) {
    console.error('Error deleting appointment from Google Sheets:', error);
    throw new Error('Errore nell\'eliminazione dell\'appuntamento');
  }
}

// PRODOTTI (MAGAZZINO)
export async function getProducts() {
  try {
    const sheets = await getGoogleSheetsService();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Prodotti!A2:I', // Skip header row
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      id: index + 1,
      name: row[0] || '',
      brand: row[1] || '',
      category: row[2] || '',
      quantity: parseInt(row[3]) || 0,
      min_quantity: parseInt(row[4]) || 0,
      price_purchase: parseFloat(row[5]) || 0,
      price_sale: parseFloat(row[6]) || 0,
      expiration_date: row[7] || '',
      notes: row[8] || '',
    }));
  } catch (error) {
    console.error('Error fetching products from Google Sheets:', error);
    throw new Error('Errore nel caricamento dei prodotti da Google Sheets');
  }
}

export async function addProduct(productData: ProductData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const values = [[
      productData.name,
      productData.brand,
      productData.category,
      productData.quantity || 0,
      productData.min_quantity || 0,
      '', // prezzo_acquisto (rimosso)
      '', // prezzo_vendita (rimosso)
      productData.expiration_date || '',
      productData.notes || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Prodotti!A2:I',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Prodotto aggiunto con successo' };
  } catch (error) {
    console.error('Error adding product to Google Sheets:', error);
    throw new Error('Errore nell\'aggiunta del prodotto');
  }
}

export async function updateProduct(id: number, productData: ProductData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const values = [[
      productData.name,
      productData.brand,
      productData.category,
      productData.quantity || 0,
      productData.min_quantity || 0,
      '', // prezzo_acquisto (rimosso)
      '', // prezzo_vendita (rimosso) 
      productData.expiration_date || '',
      productData.notes || ''
    ]];

    // Aggiorna la riga specifica (id + 1 perché la riga 1 è l'header)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Prodotti!A${id + 1}:I${id + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Prodotto aggiornato con successo' };
  } catch (error) {
    console.error('Error updating product in Google Sheets:', error);
    throw new Error('Errore nell\'aggiornamento del prodotto');
  }
}

export async function deleteProduct(id: number) {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Calcola la riga da eliminare (id + 1 perché la riga 1 è l'header)
    const row = id + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assumendo che sia il primo foglio
              dimension: 'ROWS',
              startIndex: row,
              endIndex: row + 1,
            },
          },
        }],
      },
    });

    return { success: true, message: 'Prodotto eliminato con successo' };
  } catch (error) {
    console.error('Error deleting product from Google Sheets:', error);
    throw new Error('Errore nell\'eliminazione del prodotto');
  }
}

// RICHIESTE APPUNTAMENTI DAL SITO WEB
export async function getAppointmentRequests() {
  try {
    console.log('Getting Google Sheets service...');
    const sheets = await getGoogleSheetsService();
    console.log('Google Sheets service obtained, fetching data...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Richieste!A2:L', // Skip header row
    });

    console.log('Google Sheets response received:', response.data.values?.length || 0, 'rows');
    const rows = response.data.values || [];
    
    const mappedData = rows.map((row, index) => ({
      id: index + 1,
      nome: row[0] || '',
      cognome: row[1] || '',
      telefono: row[2] || '',
      email: row[3] || '',
      servizio: row[4] || '',
      data_preferita: row[5] || '',
      ora_preferita: row[6] || '',
      note: row[7] || '',
      stato: row[8] || '',
      origine: row[9] || '',
      data_richiesta: row[10] || ''
    }));
    
    console.log('Data mapped successfully:', mappedData.length, 'requests');
    return mappedData;
  } catch (error) {
    console.error('Error in getAppointmentRequests:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific Google Sheets API errors
      if (error.message.includes('invalid_grant')) {
        throw new Error('Google Sheets authentication failed - invalid credentials');
      } else if (error.message.includes('permission')) {
        throw new Error('Google Sheets access denied - check permissions');
      } else if (error.message.includes('not found')) {
        throw new Error('Google Sheets spreadsheet not found');
      }
    }
    
    throw error;
  }
}

export async function addAppointmentRequest(requestData: AppointmentRequestData) {
  try {
    const sheets = await getGoogleSheetsService();
    
    const values = [[
      requestData.nome,
      requestData.cognome || '',
      requestData.telefono,
      requestData.email || '',
      requestData.servizio,
      requestData.data_preferita,
      requestData.ora_preferita || '',
      requestData.note || '',
      requestData.stato,
      requestData.origine,
      requestData.data_richiesta,
      '' // note interne vuote inizialmente
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Richieste!A2:L',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Richiesta appuntamento aggiunta con successo' };
  } catch (error) {
    console.error('Error adding appointment request to Google Sheets:', error);
    throw new Error('Errore nell\'aggiunta della richiesta appuntamento');
  }
}

export async function updateAppointmentRequestStatus(id: number, newStatus: string, notes?: string) {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Prima ottieni la richiesta esistente
    const requests = await getAppointmentRequests();
    const request = requests.find(r => r.id === id);
    
    if (!request) {
      throw new Error('Richiesta non trovata');
    }

    // Aggiorna con il nuovo stato
    const values = [[
      request.nome,
      request.cognome || '',
      request.telefono,
      request.email || '',
      request.servizio,
      request.data_preferita,
      request.ora_preferita || '',
      request.note || '',
      newStatus, // Nuovo stato
      request.origine,
      request.data_richiesta,
      notes || '' // Note interne
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Richieste!A${id + 1}:L${id + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true, message: 'Stato richiesta aggiornato con successo' };
  } catch (error) {
    console.error('Error updating appointment request status:', error);
    throw new Error('Errore nell\'aggiornamento dello stato della richiesta');
  }
}

export async function deleteAppointmentRequest(id: number) {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Calcola la riga da eliminare (id + 1 perché la riga 1 è l'header)
    const row = id + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assumendo che sia il primo foglio
              dimension: 'ROWS',
              startIndex: row,
              endIndex: row + 1,
            },
          },
        }],
      },
    });

    return { success: true, message: 'Richiesta eliminata con successo' };
  } catch (error) {
    console.error('Error deleting appointment request:', error);
    throw new Error('Errore nell\'eliminazione della richiesta');
  }
}

// Funzione per inizializzare il foglio Google Sheets
export async function initializeGoogleSheet() {
  try {
    const sheets = await getGoogleSheetsService();
    
    // Crea le intestazioni per i fogli
    const requests = [
      // Foglio Clienti
      {
        range: 'Clienti!A1:F1',
        values: [['Nome', 'Cognome', 'Telefono', 'Email', 'Compleanno', 'Note']]
      },
      // Foglio Appuntamenti  
      {
        range: 'Appuntamenti!A1:I1',
        values: [['ID Cliente', 'Nome Cliente', 'Telefono', 'Data', 'Ora', 'Servizio', 'Durata', 'Stato', 'Note']]
      },
      // Foglio Prodotti
      {
        range: 'Prodotti!A1:I1', 
        values: [['Nome', 'Marca', 'Categoria', 'Quantità', 'Quantità Min', 'Prezzo Acquisto', 'Prezzo Vendita', 'Scadenza', 'Note']]
      },
      // Foglio Richieste (dal sito web)
      {
        range: 'Richieste!A1:L1',
        values: [['Nome', 'Cognome', 'Telefono', 'Email', 'Servizio', 'Data Preferita', 'Ora Preferita', 'Note', 'Stato', 'Origine', 'Data Richiesta', 'Note Interne']]
      }
    ];

    for (const request of requests) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: request.range,
        valueInputOption: 'RAW',
        requestBody: { values: request.values },
      });
    }

    return { success: true, message: 'Foglio Google Sheets inizializzato con successo' };
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw new Error('Errore nell\'inizializzazione del foglio Google Sheets');
  }
}
