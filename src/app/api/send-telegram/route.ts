import { NextRequest, NextResponse } from 'next/server';

interface TelegramRequest {
  chatId: string; // ID Telegram del cliente
  message: string;
  type: 'birthday' | 'appointment';
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, type, name }: TelegramRequest = await request.json();

    if (!chatId || !message) {
      return NextResponse.json({ error: 'Chat ID e messaggio sono obbligatori' }, { status: 400 });
    }

    // TELEGRAM BOT GRATUITO (illimitato!)
    if (process.env.TELEGRAM_ENABLED === 'true' && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const telegramMessage = formatTelegramMessage(message, type, name || 'Cliente');
        
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        });

        const result = await response.json();

        if (result.ok) {
          console.log(`✅ TELEGRAM GRATUITO inviato: ${result.result.message_id}`);
          
          return NextResponse.json({
            success: true,
            message: 'Messaggio Telegram inviato con successo (gratuito!)',
            chatId,
            name,
            type,
            messageId: result.result.message_id,
            sentAt: new Date().toISOString()
          });
        } else {
          throw new Error(`Telegram API error: ${result.description}`);
        }

      } catch (telegramError) {
        console.error('Errore Telegram:', telegramError);
        throw new Error(`Errore Telegram: ${telegramError instanceof Error ? telegramError.message : 'Sconosciuto'}`);
      }
    }

    // SIMULAZIONE per testing
    console.log(`🤖 TELEGRAM SIMULATO inviato a ${chatId} (${name}):`);
    console.log(`Tipo: ${type}`);
    console.log(`Messaggio: ${message}`);
    console.log('---');

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Messaggio Telegram inviato con successo (simulato)',
      chatId,
      name,
      type,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Errore invio Telegram:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function formatTelegramMessage(message: string, type: 'birthday' | 'appointment', name: string): string {
  const emoji = type === 'birthday' ? '🎂' : '📅';
  
  return `
${emoji} <b>Gresilda Hairstyle</b> ${emoji}

Ciao <b>${name}</b>! 👋

${message}

${type === 'birthday' ? `
🎉 <b>Tanti auguri da tutto lo staff!</b>
🎁 Prenota oggi e ricevi uno sconto speciale per il tuo compleanno!
` : ''}

📞 <b>Chiamaci per prenotare:</b>
+39 342 123 4567

📍 <b>Dove siamo:</b>
Via Roma 123, Milano

💅 <i>Il tuo salone di bellezza di fiducia</i>
  `.trim();
}

export async function GET() {
  return NextResponse.json({
    message: 'API Telegram attiva - Servizio completamente gratuito!',
    telegramEnabled: process.env.TELEGRAM_ENABLED === 'true',
    botConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    timestamp: new Date().toISOString()
  });
}
