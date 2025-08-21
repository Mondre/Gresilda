'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface AppointmentRequest {
  id: number;
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

export default function AppointmentRequests() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/appointment-requests');
      const data = await response.json();
      
      // Check if data is an array (success) or has error property (failure)
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data.error) {
        console.error('API Error:', data.error);
        setRequests([]); // Set empty array on error
      } else {
        console.error('Unexpected response format:', data);
        setRequests([]);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle richieste:', error);
      setRequests([]); // Set empty array on network error
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: number, action: 'confirm' | 'reject' | 'called', notes?: string) => {
    setActionLoading(requestId);
    
    try {
      const response = await fetch(`/api/appointment-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        const result = await response.json();
        // Ricarica le richieste per aggiornare la vista
        await fetchRequests();
        
        // Mostra messaggio di successo
        alert(result.message || 'Operazione completata con successo!');
        
        console.log('Operazione completata:', result.message);
      } else {
        throw new Error('Errore durante l\'aggiornamento');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'operazione. Riprova.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCall = (telefono: string) => {
    // Apre il dialer del telefono o skype
    window.open(`tel:${telefono}`, '_self');
  };

  useEffect(() => {
    fetchRequests();
    // Aggiorna ogni 2 minuti per nuove richieste
    const interval = setInterval(fetchRequests, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('it-IT');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString;
  };

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'DA_CONFERMARE': return 'bg-yellow-100 text-yellow-800';
      case 'CONFERMATO': return 'bg-green-100 text-green-800';
      case 'RIFIUTATO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Caricamento richieste...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-pink-600" />
            Richieste dal Sito Web
            {requests.length > 0 && (
              <span className="ml-2 bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {requests.filter(r => r.stato === 'DA_CONFERMARE').length} da confermare
              </span>
            )}
          </h2>
          <button
            onClick={fetchRequests}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">Nessuna richiesta di appuntamento</p>
            <p className="text-sm text-gray-400">
              Le richieste dal tuo sito web appariranno qui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.nome} {request.cognome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Richiesta il {formatDate(request.data_richiesta)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.stato)}`}>
                    {request.stato.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`tel:${request.telefono}`} className="hover:text-pink-600">
                        {request.telefono}
                      </a>
                    </div>
                    
                    {request.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <a href={`mailto:${request.email}`} className="hover:text-pink-600">
                          {request.email}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(request.data_preferita)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {formatTime(request.ora_preferita || '')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Servizio:</span>
                      <span className="ml-2 text-gray-600">{request.servizio}</span>
                    </div>
                    
                    {request.note && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Note:</span>
                        <p className="mt-1 text-gray-600">{request.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {request.stato === 'DA_CONFERMARE' && (
                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => handleAction(request.id, 'confirm')}
                      disabled={actionLoading === request.id}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {actionLoading === request.id ? 'Confermando...' : 'Conferma Appuntamento'}
                    </button>
                    <button 
                      onClick={() => handleAction(request.id, 'reject')}
                      disabled={actionLoading === request.id}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {actionLoading === request.id ? 'Rifiutando...' : 'Rifiuta'}
                    </button>
                    <button 
                      onClick={() => handleCall(request.telefono)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Chiama Cliente
                    </button>
                  </div>
                )}

                {request.stato !== 'DA_CONFERMARE' && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      Gestita il {new Date().toLocaleDateString('it-IT')}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleCall(request.telefono)}
                        className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Chiama
                      </button>
                      {request.stato === 'RIFIUTATO' && (
                        <button 
                          onClick={() => handleAction(request.id, 'confirm')}
                          className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          Riattiva
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
