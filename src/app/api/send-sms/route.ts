import { NextRequest, NextResponse } from 'next/server';

interface SMSRequest {
  phone: string;
  message: string;
  type: 'birthday' | 'appointment';
}

// Per ora simuliamo l'invio, ma qui integreresti Twilio, AWS SNS, o altri servizi
export async function POST(request: NextRequest) {
  try {
    const { phone, message, type }: SMSRequest = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Telefono e messaggio sono obbligatori' }, { status: 400 });
    }

    // Validazione numero di telefono (formato italiano)
    const phoneRegex = /^(\+39|0039|39)?[\s-]?([0-9]{2,4})[\s-]?([0-9]{6,8})$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Numero di telefono non valido' }, { status: 400 });
    }

    // TODO: Qui implementeresti l'integrazione con servizi SMS reali
    // Esempi di servizi che puoi usare:

    // OPZIONE 1: Twilio (implementazione reale)
    if (process.env.SMS_ENABLED === 'true' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        import('twilio').then(async (twilioModule) => {
          const twilio = twilioModule.default;
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          
          const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
            to: phone.startsWith('+') ? phone : `+39${phone.replace(/\D/g, '')}`
          });

          console.log(`✅ SMS REALE inviato tramite Twilio: ${result.sid}`);
          
          return NextResponse.json({
            success: true,
            message: 'SMS inviato con successo tramite Twilio',
            phone,
            type,
            twilioSid: result.sid,
            sentAt: new Date().toISOString()
          });
        });
      } catch (twilioError) {
        console.error('Errore Twilio:', twilioError);
        throw new Error(`Errore Twilio: ${twilioError instanceof Error ? twilioError.message : 'Sconosciuto'}`);
      }
    }

    // OPZIONE 1: Twilio (più popolare)
    // const twilio = require('twilio');
    // const client = twilio('ACCOUNT_SID', 'AUTH_TOKEN');
    // const result = await client.messages.create({
    //   body: message,
    //   from: '+1234567890', // Tuo numero Twilio
    //   to: phone
    // });

    // OPZIONE 2: AWS SNS
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS();
    // const result = await sns.publish({
    //   Message: message,
    //   PhoneNumber: phone
    // }).promise();

    // OPZIONE 3: API SMS italiana (es. Skebby, SMS.it)
    // const response = await fetch('https://api.skebby.it/API/v1.0/REST/sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message_type: 'GP',
    //     message: message,
    //     recipient: [phone],
    //     sender: 'Gresilda'
    //   })
    // });

    // SIMULAZIONE - Per testing senza spendere denaro
    console.log(`📱 SMS SIMULATO inviato a ${phone}:`);
    console.log(`Tipo: ${type}`);
    console.log(`Messaggio: ${message}`);
    console.log('---');

    // Simula un piccolo ritardo come un vero servizio SMS
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In un ambiente reale, salveresti il log degli SMS nel database
    // await runQuery('INSERT INTO sms_log (phone, message, type, status, sent_at) VALUES (?, ?, ?, ?, ?)', 
    //   [phone, message, type, 'sent', new Date().toISOString()]);

    return NextResponse.json({
      success: true,
      message: 'SMS inviato con successo (simulato)',
      phone,
      type,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Errore invio SMS:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Ottieni log degli SMS inviati
export async function GET() {
  try {
    // In un ambiente reale, recupereresti dal database
    return NextResponse.json({
      message: 'Log SMS - Funzionalità da implementare con database reale',
      // logs: await allQuery('SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 100')
    });
  } catch (error) {
    console.error('Errore recupero log SMS:', error);
    return NextResponse.json({ error: 'Errore nel recupero log SMS' }, { status: 500 });
  }
}
