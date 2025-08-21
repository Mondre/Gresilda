'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Search,
  History,
  Star,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  birthday?: string;
  notes?: string;
}

interface AppointmentHistory {
  id: number;
  customer_name: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  duration?: number;
}

interface CustomerStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  favoriteService: string;
  totalSpent: number;
  lastVisit?: string;
  firstVisit?: string;
}

export default function CustomerHistory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Carica tutti i clienti
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Errore nel caricamento dei clienti:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carica lo storico appuntamenti per un cliente specifico
  const fetchCustomerHistory = async (customer: Customer) => {
    setAppointmentsLoading(true);
    try {
      // Cerca appuntamenti per telefono (più affidabile)
      const response = await fetch(`/api/appointments?customerPhone=${encodeURIComponent(customer.phone)}`);
      const data = await response.json();
      
      // Filtra e ordina gli appuntamenti
      const customerAppointments = data
        .filter((apt: AppointmentHistory) => 
          apt.phone === customer.phone || 
          apt.customer_name.toLowerCase().includes(`${customer.first_name} ${customer.last_name}`.toLowerCase())
        )
        .sort((a: AppointmentHistory, b: AppointmentHistory) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setAppointments(customerAppointments);
      
      // Calcola statistiche
      calculateCustomerStats(customerAppointments);
      
    } catch (error) {
      console.error('Errore nel caricamento dello storico:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Calcola statistiche del cliente
  const calculateCustomerStats = (appointments: AppointmentHistory[]) => {
    const stats: CustomerStats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      noShowAppointments: appointments.filter(apt => apt.status === 'no-show').length,
      favoriteService: '',
      totalSpent: 0,
      lastVisit: appointments.length > 0 ? appointments[0].date : undefined,
      firstVisit: appointments.length > 0 ? appointments[appointments.length - 1].date : undefined,
    };

    // Trova il servizio preferito
    const serviceCount: { [key: string]: number } = {};
    appointments.forEach(apt => {
      if (apt.status === 'completed') {
        serviceCount[apt.service] = (serviceCount[apt.service] || 0) + 1;
      }
    });

    stats.favoriteService = Object.entries(serviceCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nessuno';

    setCustomerStats(stats);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerHistory(customer);
  };

  // Filtra clienti per ricerca
  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'no-show':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Cancellato';
      case 'no-show':
        return 'Non Presentato';
      case 'scheduled':
        return 'Programmato';
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Caricamento clienti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <History className="w-5 h-5 mr-2 text-pink-600" />
          Storico Clienti
        </h2>
      </div>

      <div className="flex h-[600px]">
        {/* Lista clienti a sinistra */}
        <div className="w-1/3 border-r border-gray-200 p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nessun cliente trovato</p>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-pink-50 border-pink-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dettagli cliente a destra */}
        <div className="flex-1 p-6">
          {!selectedCustomer ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <History className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Seleziona un Cliente
              </h3>
              <p className="text-gray-500">
                Scegli un cliente dalla lista per visualizzare il suo storico completo
              </p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {/* Header cliente */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </h2>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedCustomer.phone}
                        </span>
                        {selectedCustomer.email && (
                          <span className="text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {selectedCustomer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiche cliente */}
                {customerStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-600">Appuntamenti Totali</p>
                          <p className="text-xl font-bold text-blue-900">{customerStats.totalAppointments}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-green-600">Completati</p>
                          <p className="text-xl font-bold text-green-900">{customerStats.completedAppointments}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm text-orange-600">Servizio Preferito</p>
                          <p className="text-sm font-bold text-orange-900 truncate">{customerStats.favoriteService}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                        <div>
                          <p className="text-sm text-purple-600">Ultima Visita</p>
                          <p className="text-sm font-bold text-purple-900">
                            {customerStats.lastVisit ? formatDate(customerStats.lastVisit) : 'Mai'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Storico appuntamenti */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Storico Appuntamenti</h3>
                  <button
                    onClick={() => fetchCustomerHistory(selectedCustomer)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Caricamento storico...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nessun appuntamento trovato per questo cliente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(appointment.status)}
                              <h4 className="font-medium text-gray-900">{appointment.service}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(appointment.date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.time}
                              </span>
                              {appointment.duration && (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {appointment.duration} min
                                </span>
                              )}
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="flex items-start">
                                  <FileText className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                                  {appointment.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
