import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
  email: string;
  name: string;
  message: string;
  type: 'birthday' | 'appointment';
  subject?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, message, type, subject }: EmailRequest = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Email e messaggio sono obbligatori' }, { status: 400 });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 });
    }

    // OPZIONE GRATUITA: Gmail SMTP (completamente gratis!)
    if (process.env.EMAIL_ENABLED === 'true') {
      try {
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER, // il tuo Gmail
            pass: process.env.GMAIL_APP_PASSWORD // password app Gmail (non la tua password normale!)
          }
        });

        const htmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #f97316); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">💇‍♀️ Gresilda Hairstyle</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
              <h2 style="color: #ec4899;">Ciao ${name}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                ${message.replace(/\n/g, '<br>')}
              </p>
              ${type === 'birthday' ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e;">🎂 Tanti auguri da tutto lo staff di Gresilda Hairstyle!</p>
                </div>
              ` : ''}
              <div style="text-align: center; margin: 30px 0;">
                <a href="tel:+393421234567" style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  📞 Chiamaci per prenotare
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Gresilda Hairstyle - Via Roma 123, Milano</p>
              <p>Tel: +39 342 123 4567 | Email: info@gresildahairstyle.it</p>
            </div>
          </div>
        `;

        const mailOptions = {
          from: `"Gresilda Hairstyle" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: subject || (type === 'birthday' ? '🎂 Tanti Auguri da Gresilda Hairstyle!' : '📅 Promemoria Appuntamento'),
          html: htmlTemplate
        };

        const result = await transporter.sendMail(mailOptions);
        
        console.log(`✅ EMAIL GRATUITA inviata: ${result.messageId}`);
        
        return NextResponse.json({
          success: true,
          message: 'Email inviata con successo (Gmail gratuito)',
          email,
          name,
          type,
          messageId: result.messageId,
          sentAt: new Date().toISOString()
        });

      } catch (emailError) {
        console.error('Errore Gmail:', emailError);
        throw new Error(`Errore Gmail: ${emailError instanceof Error ? emailError.message : 'Sconosciuto'}`);
      }
    }

    // SIMULAZIONE per testing
    console.log(`📧 EMAIL SIMULATA inviata a ${email} (${name}):`);
    console.log(`Tipo: ${type}`);
    console.log(`Oggetto: ${subject || (type === 'birthday' ? 'Tanti Auguri!' : 'Promemoria Appuntamento')}`);
    console.log(`Messaggio: ${message}`);
    console.log('---');

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Email inviata con successo (simulata)',
      email,
      name,
      type,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Email attiva - Servizio completamente gratuito con Gmail!',
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    timestamp: new Date().toISOString()
  });
}
