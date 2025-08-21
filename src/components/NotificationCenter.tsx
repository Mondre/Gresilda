'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Gift, 
  Phone, 
  MessageCircle, 
  Clock,
  Check,
  Send,
  Settings
} from 'lucide-react';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  birthday?: string;
}

interface Appointment {
  id: number;
  customer_id: number;
  customer_name: string;
  phone?: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface Birthday {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  birthday: string;
  daysUntil: number;
}

interface UpcomingAppointment {
  id: number;
  customer_id: number;
  customer_name: string;
  phone?: string;
  date: string;
  time: string;
  service: string;
  hoursUntil: number;
}

interface NotificationSettings {
  birthdayEnabled: boolean;
  birthdayDaysAhead: number;
  appointmentEnabled: boolean;
  appointmentHoursAhead: number;
  autoSendEnabled: boolean;
}

function NotificationCenter() {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    birthdayEnabled: true,
    birthdayDaysAhead: 7,
    appointmentEnabled: true,
    appointmentHoursAhead: 24,
    autoSendEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Controlla le notifiche ogni 30 minuti
    const interval = setInterval(fetchNotifications, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.birthdayEnabled, settings.birthdayDaysAhead, settings.appointmentEnabled, settings.appointmentHoursAhead]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch clienti per compleanni
      const customersRes = await fetch('/api/customers');
      const customers = await customersRes.json();

      // Fetch appuntamenti futuri
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 3); // Prossimi 3 giorni
      
      const appointmentsRes = await fetch(
        `/api/appointments?startDate=${today.toISOString().split('T')[0]}&endDate=${futureDate.toISOString().split('T')[0]}`
      );
      const appointments = await appointmentsRes.json();

      // Processa compleanni
      const birthdays = processUpcomingBirthdays(customers);
      setUpcomingBirthdays(birthdays);

      // Processa appuntamenti
      const upcomingAppts = processUpcomingAppointments(appointments);
      setUpcomingAppointments(upcomingAppts);

    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [settings.birthdayEnabled, settings.birthdayDaysAhead, settings.appointmentEnabled, settings.appointmentHoursAhead]);

  const processUpcomingBirthdays = (customers: Customer[]): Birthday[] => {
    if (!settings.birthdayEnabled) return [];

    const today = new Date();
    const maxDaysAhead = settings.birthdayDaysAhead;
    
    return customers
      .filter(customer => customer.birthday)
      .map(customer => {
        const birthday = new Date(customer.birthday!);
        const thisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
        
        // Determina se il compleanno è quest'anno o l'anno prossimo
        const nextBirthday = thisYear >= today ? thisYear : nextYear;
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          customer_id: customer.id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          birthday: customer.birthday!,
          daysUntil
        };
      })
      .filter(birthday => birthday.daysUntil <= maxDaysAhead && birthday.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const processUpcomingAppointments = (appointments: Appointment[]): UpcomingAppointment[] => {
    if (!settings.appointmentEnabled) return [];

    const now = new Date();
    const maxHoursAhead = settings.appointmentHoursAhead;

    return appointments
      .filter(appointment => appointment.status === 'scheduled')
      .map(appointment => {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        return {
          id: appointment.id,
          customer_id: appointment.customer_id,
          customer_name: appointment.customer_name,
          phone: appointment.phone,
          date: appointment.date,
          time: appointment.time,
          service: appointment.service,
          hoursUntil: Math.round(hoursUntil)
        };
      })
      .filter(appointment => 
        appointment.hoursUntil <= maxHoursAhead && 
        appointment.hoursUntil > 0
      )
      .sort((a, b) => a.hoursUntil - b.hoursUntil);
  };

  const sendBirthdayMessage = async (birthday: Birthday) => {
    if (!birthday.phone) {
      alert('Questo cliente non ha un numero di telefono!');
      return;
    }

    const message = generateBirthdayMessage(birthday);
    
    try {
      // Mostra messaggio di invio in corso
      const loadingAlert = `Invio messaggio di compleanno a ${birthday.first_name} ${birthday.last_name}...\n\n"${message}"\n\nAttendi...`;
      console.log(loadingAlert);
      
      // Invia SMS tramite API
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: birthday.phone,
          message: message,
          type: 'birthday'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Segna come inviato
        setSentMessages(prev => new Set([...prev, `birthday-${birthday.customer_id}`]));
        
        // Mostra conferma successo
        alert(`✅ Messaggio di compleanno inviato con successo!\n\nA: ${birthday.first_name} ${birthday.last_name}\nTelefono: ${birthday.phone}\nOrario: ${new Date().toLocaleTimeString('it-IT')}\n\n"${message}"`);
      } else {
        throw new Error(result.error || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error('Errore invio SMS compleanno:', error);
      alert(`❌ Errore nell'invio del messaggio!\n\nA: ${birthday.first_name} ${birthday.last_name}\nErrore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}\n\nRiprova più tardi.`);
    }
  };

  const sendAppointmentReminder = async (appointment: UpcomingAppointment) => {
    if (!appointment.phone) {
      alert('Questo cliente non ha un numero di telefono!');
      return;
    }

    const message = generateAppointmentMessage(appointment);
    
    try {
      // Mostra messaggio di invio in corso
      const loadingAlert = `Invio promemoria a ${appointment.customer_name}...\n\n"${message}"\n\nAttendi...`;
      console.log(loadingAlert);

      // Invia SMS tramite API
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: appointment.phone,
          message: message,
          type: 'appointment'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Segna come inviato
        setSentMessages(prev => new Set([...prev, `appointment-${appointment.id}`]));
        
        // Mostra conferma successo
        alert(`✅ Promemoria inviato con successo!\n\nA: ${appointment.customer_name}\nTelefono: ${appointment.phone}\nAppuntamento: ${new Date(appointment.date).toLocaleDateString('it-IT')} alle ${appointment.time}\nOrario invio: ${new Date().toLocaleTimeString('it-IT')}\n\n"${message}"`);
      } else {
        throw new Error(result.error || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error('Errore invio SMS promemoria:', error);
      alert(`❌ Errore nell'invio del promemoria!\n\nA: ${appointment.customer_name}\nErrore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}\n\nRiprova più tardi.`);
    }
  };

  const generateBirthdayMessage = (birthday: Birthday): string => {
    if (birthday.daysUntil === 0) {
      return `🎉 Tanti auguri ${birthday.first_name}! 🎂 Il team di Gresilda Hairstyle ti augura una giornata speciale! Per festeggiare, abbiamo una sorpresa per te al tuo prossimo appuntamento! ✨💄`;
    } else {
      return `🎁 Ciao ${birthday.first_name}! Il tuo compleanno si avvicina (${birthday.daysUntil} giorni)! Da Gresilda Hairstyle abbiamo preparato qualcosa di speciale per te. Prenota il tuo appuntamento! 💇‍♀️✨`;
    }
  };

  const generateAppointmentMessage = (appointment: UpcomingAppointment): string => {
    const timeMessage = appointment.hoursUntil <= 2 
      ? `tra ${appointment.hoursUntil} ${appointment.hoursUntil === 1 ? 'ora' : 'ore'}`
      : `domani alle ${appointment.time}`;
      
    return `👋 Ciao! Questo è un promemoria per il tuo appuntamento da Gresilda Hairstyle ${timeMessage} per ${appointment.service}. Ti aspettiamo! 💄✨ Per modifiche chiama il nostro numero.`;
  };

  const markAllBirthdaysSent = () => {
    const newSent = new Set(sentMessages);
    upcomingBirthdays.forEach(birthday => {
      newSent.add(`birthday-${birthday.customer_id}`);
    });
    setSentMessages(newSent);
  };

  const markAllAppointmentsSent = () => {
    const newSent = new Set(sentMessages);
    upcomingAppointments.forEach(appointment => {
      newSent.add(`appointment-${appointment.id}`);
    });
    setSentMessages(newSent);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Caricamento notifiche...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-pink-600" />
          Centro Notifiche
        </h1>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Impostazioni
        </button>
      </div>

      {/* Impostazioni */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni Notifiche</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Notifiche Compleanni</h4>
                <p className="text-sm text-gray-600">Invia auguri automatici ai clienti</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.birthdayEnabled}
                  onChange={(e) => setSettings({...settings, birthdayEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            {settings.birthdayEnabled && (
              <div className="ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giorni di anticipo per compleanni
                </label>
                <select
                  value={settings.birthdayDaysAhead}
                  onChange={(e) => setSettings({...settings, birthdayDaysAhead: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value={1}>1 giorno</option>
                  <option value={3}>3 giorni</option>
                  <option value={7}>7 giorni</option>
                  <option value={14}>14 giorni</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Promemoria Appuntamenti</h4>
                <p className="text-sm text-gray-600">Ricorda ai clienti i loro appuntamenti</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.appointmentEnabled}
                  onChange={(e) => setSettings({...settings, appointmentEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.appointmentEnabled && (
              <div className="ml-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ore di anticipo per promemoria
                </label>
                <select
                  value={settings.appointmentHoursAhead}
                  onChange={(e) => setSettings({...settings, appointmentHoursAhead: parseInt(e.target.value)})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 ore</option>
                  <option value={4}>4 ore</option>
                  <option value={24}>24 ore</option>
                  <option value={48}>48 ore</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compleanni */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-600" />
                Compleanni in Arrivo ({upcomingBirthdays.length})
              </h3>
              {upcomingBirthdays.length > 0 && (
                <button
                  onClick={markAllBirthdaysSent}
                  className="text-sm text-pink-600 hover:text-pink-800 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Segna tutti come inviati
                </button>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {upcomingBirthdays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nessun compleanno nei prossimi giorni</p>
              </div>
            ) : (
              upcomingBirthdays.map((birthday) => {
                const messageKey = `birthday-${birthday.customer_id}`;
                const isSent = sentMessages.has(messageKey);
                
                return (
                  <div key={birthday.customer_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {birthday.first_name} {birthday.last_name}
                          </h4>
                          {birthday.daysUntil === 0 && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                              OGGI! 🎉
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {birthday.daysUntil === 0 
                            ? 'Compleanno oggi!' 
                            : birthday.daysUntil === 1
                            ? 'Compleanno domani'
                            : `Compleanno tra ${birthday.daysUntil} giorni`
                          }
                        </p>
                        {birthday.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {birthday.phone}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isSent ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Inviato
                          </span>
                        ) : (
                          <button
                            onClick={() => sendBirthdayMessage(birthday)}
                            disabled={!birthday.phone}
                            className="flex items-center gap-1 px-3 py-1 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            Invia Auguri
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Promemoria Appuntamenti */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Promemoria Appuntamenti ({upcomingAppointments.length})
              </h3>
              {upcomingAppointments.length > 0 && (
                <button
                  onClick={markAllAppointmentsSent}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Segna tutti come inviati
                </button>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nessun appuntamento da confermare</p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => {
                const messageKey = `appointment-${appointment.id}`;
                const isSent = sentMessages.has(messageKey);
                
                return (
                  <div key={appointment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {appointment.customer_name}
                          </h4>
                          {appointment.hoursUntil <= 2 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                              URGENTE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString('it-IT')} alle {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                        <p className="text-sm text-blue-600">
                          {appointment.hoursUntil <= 1 
                            ? 'Tra meno di un\'ora!'
                            : appointment.hoursUntil <= 24
                            ? `Tra ${appointment.hoursUntil} ${appointment.hoursUntil === 1 ? 'ora' : 'ore'}`
                            : `Tra ${Math.round(appointment.hoursUntil / 24)} giorni`
                          }
                        </p>
                        {appointment.phone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {appointment.phone}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isSent ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            Inviato
                          </span>
                        ) : (
                          <button
                            onClick={() => sendAppointmentReminder(appointment)}
                            disabled={!appointment.phone}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Invia Promemoria
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Statistiche Rapide */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Notifiche</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gift className="w-4 h-4 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-pink-600">{upcomingBirthdays.length}</p>
            <p className="text-sm text-gray-600">Compleanni in arrivo</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
            <p className="text-sm text-gray-600">Promemoria da inviare</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{sentMessages.size}</p>
            <p className="text-sm text-gray-600">Messaggi inviati</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bell className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-600">
              {upcomingBirthdays.length + upcomingAppointments.length}
            </p>
            <p className="text-sm text-gray-600">Totale notifiche</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter;
