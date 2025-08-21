'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Grid3X3, CalendarIcon, CalendarDays, Edit2, Trash2 } from 'lucide-react';

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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

function OutlookCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    date: '',
    time: '09:00',
    service: '',
    duration: 60,
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
    notes: ''
  });

  // Carica appuntamenti del periodo corrente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = '/api/appointments';
        if (view === 'month') {
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          url = `/api/appointments?month=${year}-${month}`;
        } else if (view === 'week' || view === 'day') {
          const dateString = currentDate.toISOString().split('T')[0];
          url = `/api/appointments?date=${dateString}`;
        }

        const [appointmentsRes, customersRes] = await Promise.all([
          fetch(url),
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

    loadData();
  }, [currentDate, view]);

  // Calcola i giorni del calendario in base alla vista
  const calendarDays = useMemo(() => {
    const currentDateOnly = new Date();
    currentDateOnly.setHours(0, 0, 0, 0);

    if (view === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = new Date(firstDay);
      const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
      startDate.setDate(firstDay.getDate() - (firstDayOfWeek - 1));
      
      const endDate = new Date(lastDay);
      const lastDayOfWeek = lastDay.getDay() === 0 ? 7 : lastDay.getDay();
      endDate.setDate(lastDay.getDate() + (7 - lastDayOfWeek));
      
      const days: CalendarDay[] = [];
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);
        
        const dayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === dayDate.getTime();
        });
        
        days.push({
          date: new Date(dayDate),
          isCurrentMonth: dayDate.getMonth() === month,
          isToday: dayDate.getTime() === currentDateOnly.getTime(),
          appointments: dayAppointments
        });
      }
      
      return days;
    } else if (view === 'week') {
      const days: CalendarDay[] = [];
      
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay() === 0 ? 7 : startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        dayDate.setHours(0, 0, 0, 0);
        
        const dayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === dayDate.getTime();
        });
        
        days.push({
          date: new Date(dayDate),
          isCurrentMonth: true,
          isToday: dayDate.getTime() === currentDateOnly.getTime(),
          appointments: dayAppointments
        });
      }
      
      return days;
    } else {
      const dayDate = new Date(currentDate);
      dayDate.setHours(0, 0, 0, 0);
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === dayDate.getTime();
      });
      
      return [{
        date: new Date(dayDate),
        isCurrentMonth: true,
        isToday: dayDate.getTime() === currentDateOnly.getTime(),
        appointments: dayAppointments
      }];
    }
  }, [currentDate, appointments, view]);

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
      } else if (view === 'week') {
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 7);
        } else {
          newDate.setDate(prev.getDate() + 7);
        }
      } else {
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 1);
        } else {
          newDate.setDate(prev.getDate() + 1);
        }
      }
      return newDate;
    });
  };

  const getNavigationLabel = () => {
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    if (view === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay() === 0 ? 7 : startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1));
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handleDayClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setFormData(prev => ({ ...prev, date: dateString }));
    setShowForm(true);
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
        // Aggiorna la lista appuntamenti localmente invece di ricaricare la pagina
        if (editingAppointment) {
          setAppointments(prev => prev.map(apt => 
            apt.id === editingAppointment.id 
              ? { ...apt, ...appointmentData, id: editingAppointment.id }
              : apt
          ));
          alert('Appuntamento aggiornato con successo!');
        } else {
          // Per nuovo appuntamento, ricarica i dati
          const refreshUrl = view === 'month' 
            ? `/api/appointments?month=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
            : `/api/appointments?date=${currentDate.toISOString().split('T')[0]}`;
          
          const refreshResponse = await fetch(refreshUrl);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setAppointments(Array.isArray(refreshData) ? refreshData : []);
          }
          alert('Appuntamento creato con successo!');
        }
        
        setShowForm(false);
        setEditingAppointment(null);
        resetForm();
      } else {
        throw new Error('Errore nel salvare l\'appuntamento');
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      alert('Errore nel salvare l\'appuntamento. Riprova.');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      date: '',
      time: '09:00',
      service: '',
      duration: 60,
      status: 'scheduled',
      notes: ''
    });
    setSelectedDate('');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customer_id: String(appointment.customer_id || ''),
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      duration: appointment.duration || 60,
      status: appointment.status || 'scheduled',
      notes: appointment.notes || ''
    });
    setSelectedDate(appointment.date);
    setShowForm(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!appointment.id) return;
    
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare l'appuntamento di ${appointment.customer_name} del ${new Date(appointment.date).toLocaleDateString('it-IT')} alle ${appointment.time}?`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Rimuovi l'appuntamento dalla lista locale
        setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
        alert('Appuntamento eliminato con successo!');
      } else {
        throw new Error('Errore nell\'eliminazione dell\'appuntamento');
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Errore nell\'eliminazione dell\'appuntamento. Riprova.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'no-show': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const renderCalendarGrid = () => {
    if (view === 'day') {
      const day = calendarDays[0];
      return (
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {day.date.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            
            <div className="space-y-3">
              {day.appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Nessun appuntamento per oggi</p>
                  <button
                    onClick={() => handleDayClick(day.date)}
                    className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Aggiungi Appuntamento
                  </button>
                </div>
              ) : (
                day.appointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-lg font-bold text-pink-600">
                        {appointment.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {appointment.customer_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.service}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-500 italic">
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(appointment.status || 'scheduled')}`}>
                        {appointment.status === 'scheduled' ? 'Programmato' : 
                         appointment.status === 'completed' ? 'Completato' :
                         appointment.status === 'cancelled' ? 'Annullato' : 'Non presentato'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppointment(appointment);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Modifica appuntamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment);
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Elimina appuntamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header giorni della settimana - solo per month e week */}
        {(view === 'month' || view === 'week') && (
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-700 border-b">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Griglia del calendario */}
        <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-gray-200 rounded-lg overflow-hidden`}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={`
                relative ${view === 'week' ? 'min-h-[200px]' : 'min-h-[120px]'} p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors
                ${!day.isCurrentMonth && view === 'month' ? 'opacity-40' : ''}
                ${day.isToday ? 'bg-pink-50 border-2 border-pink-300' : ''}
              `}
            >
              {/* Numero del giorno */}
              <div className={`
                text-sm font-medium mb-1
                ${day.isToday ? 'text-pink-700 font-bold' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {day.date.getDate()}
                {view === 'week' && (
                  <div className="text-xs text-gray-500">
                    {day.date.toLocaleDateString('it-IT', { weekday: 'short' })}
                  </div>
                )}
              </div>

              {/* Appuntamenti del giorno */}
              <div className="space-y-1">
                {day.appointments.slice(0, view === 'week' ? 8 : 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`
                      text-xs px-2 py-1 rounded text-white truncate group relative
                      ${getStatusColor(appointment.status || 'scheduled')}
                    `}
                    title={`${appointment.time} - ${appointment.customer_name} - ${appointment.service}`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{appointment.customer_name}</span>
                    </div>
                    
                    {/* Pulsanti di azione (visibili al hover) */}
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-lg p-1 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(appointment);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded text-xs"
                        title="Modifica"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(appointment);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded text-xs"
                        title="Elimina"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Indicatore per più appuntamenti */}
                {day.appointments.length > (view === 'week' ? 8 : 3) && (
                  <div className="text-xs text-gray-500 px-2">
                    +{day.appointments.length - (view === 'week' ? 8 : 3)} altri
                  </div>
                )}
              </div>

              {/* Pulsante aggiungi appuntamento (visibile al hover) */}
              <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(day.date);
                  }}
                  className="p-1 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                  title="Aggiungi appuntamento"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-bold text-xl mb-3">Errore</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
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
            <p className="text-gray-600 text-lg">Caricamento calendario...</p>
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
          <Calendar className="w-8 h-8 text-pink-600" />
          Calendario
        </h1>

        {/* Selettore vista */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'month' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Mese
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'week' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Settimana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'day' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Giorno
            </button>
          </div>
        </div>
      </div>

      {/* Controlli del calendario */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {getNavigationLabel()}
            </h2>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Griglia del calendario */}
        {renderCalendarGrid()}
      </div>

      {/* Legenda */}
      {view !== 'day' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda Stati</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">Programmato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Completato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Annullato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm text-gray-700">Non presentato</span>
            </div>
          </div>
        </div>
      )}

      {/* Form per nuovo appuntamento */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Data selezionata: {selectedDate && new Date(selectedDate).toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            
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

export default OutlookCalendar;
