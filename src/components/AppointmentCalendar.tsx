'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Plus, Edit2, Trash2 } from 'lucide-react';

interface Appointment {
  id?: number;
  customer_id?: number;
  customer_name?: string;
  phone?: string;
  date: string;
  time: string;
  duration?: number;
  service: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  phone?: string;
}

function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    service: '',
    duration: 60,
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
    notes: ''
  });

  // Carica appuntamenti e clienti
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appointmentsRes, customersRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/customers')
      ]);

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(Array.isArray(customersData) ? customersData : []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        ...formData,
        customer_id: parseInt(formData.customer_id)
      };

      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}` 
        : '/api/appointments';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingAppointment(null);
        resetForm();
        loadData();
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Errore nel salvare l\'appuntamento');
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_id: appointment.customer_id?.toString() || '',
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      duration: appointment.duration || 60,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (appointmentId: number) => {
    if (!confirm('Sei sicura di voler eliminare questo appuntamento?')) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Errore nell\'eliminare l\'appuntamento');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      service: '',
      duration: 60,
      status: 'scheduled',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmato';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      case 'no-show': return 'Non presentato';
      default: return status;
    }
  };

  // Ordina appuntamenti per data e ora
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-bold text-xl mb-3">Errore</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadData();
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Caricamento appuntamenti...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-pink-600" />
          Lista Appuntamenti
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuovo Appuntamento
        </button>
      </div>

      {/* Lista appuntamenti */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Tutti gli Appuntamenti ({appointments.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun appuntamento</h3>
              <p className="text-gray-600">Clicca su &quot;Nuovo Appuntamento&quot; per iniziare</p>
            </div>
          ) : (
            sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-lg">
                          {new Date(appointment.date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                        <span className="text-pink-600 font-bold">{appointment.time}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status || 'scheduled')}`}>
                        {getStatusLabel(appointment.status || 'scheduled')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {appointment.customer_name || 'Cliente non specificato'}
                        </span>
                      </div>
                      
                      {appointment.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{appointment.phone}</span>
                        </div>
                      )}
                      
                      <div className="text-gray-600">
                        <strong>Servizio:</strong> {appointment.service}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong>Durata:</strong> {appointment.duration || 60} minuti</span>
                      </div>
                      
                      {appointment.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Note:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Modifica"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => appointment.id && handleDelete(appointment.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form per nuovo/modifica appuntamento */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Seleziona cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orario</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Es: Taglio e piega"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durata (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    status: e.target.value as 'scheduled' | 'completed' | 'cancelled' | 'no-show'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="scheduled">Programmato</option>
                  <option value="completed">Completato</option>
                  <option value="cancelled">Annullato</option>
                  <option value="no-show">Non presentato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={3}
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                >
                  {editingAppointment ? 'Aggiorna' : 'Crea'} Appuntamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentCalendar;
