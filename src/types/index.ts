// Tipi per i clienti
export interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipi per gli appuntamenti
export interface Appointment {
  id?: number;
  customer_id?: number;
  customer?: Customer;
  customer_name?: string;  // Per le query join
  phone?: string;         // Per le query join
  first_name?: string;    // Per le query join
  last_name?: string;     // Per le query join
  date: string;
  time: string;
  duration?: number;
  service: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipi per i prodotti (solo per gestione magazzino, non per vendita)
export interface Product {
  id?: number;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  quantity?: number;
  minimum_stock?: number;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipi per i servizi (solo per organizzazione, senza prezzi)
export interface Service {
  id?: number;
  name: string;
  description?: string;
  duration?: number;
  active?: boolean;
  created_at?: string;
}

// Tipi per il calendario
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  customer_name?: string;
  service: string;
  status: string;
  duration?: number;
}

// Tipi per i promemoria
export interface Reminder {
  id?: number;
  appointment_id: number;
  type: 'birthday' | 'appointment';
  message: string;
  send_date: string;
  sent: boolean;
  created_at?: string;
}
