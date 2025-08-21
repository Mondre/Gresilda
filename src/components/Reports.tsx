'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Users, 
  Download,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AppointmentData {
  id: number;
  date: string;
  time: string;
  service: string;
  status: string;
  customer_name?: string;
}

interface CustomerData {
  id: number;
  first_name: string;
  last_name: string;
}

interface ReportData {
  period: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  topServices: { service: string; count: number }[];
  dailyStats: { date: string; appointments: number }[];
  customerStats: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  };
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = [
    { value: 'current-month', label: 'Mese corrente' },
    { value: 'last-month', label: 'Mese scorso' },
    { value: 'last-3-months', label: 'Ultimi 3 mesi' },
    { value: 'current-year', label: 'Anno corrente' },
  ];

  useEffect(() => {
    const getPeriodLabel = (period: string): string => {
      switch (period) {
        case 'current-month': return 'Mese corrente';
        case 'last-month': return 'Mese scorso';
        case 'last-3-months': return 'Ultimi 3 mesi';
        case 'current-year': return 'Anno corrente';
        default: return 'Periodo selezionato';
      }
    };

    const processReportData = (appointments: AppointmentData[], customers: CustomerData[]): ReportData => {
      // Statistiche per stato
      const completedCount = appointments.filter(apt => apt.status === 'completed' || apt.status === 'completato').length;
      const cancelledCount = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'cancellato').length;
      const noShowCount = appointments.filter(apt => apt.status === 'no-show' || apt.status === 'non-presentato').length;

      // Servizi più richiesti
      const serviceStats: Record<string, { count: number }> = {};
      appointments.forEach(apt => {
        if (!serviceStats[apt.service]) {
          serviceStats[apt.service] = { count: 0 };
        }
        serviceStats[apt.service].count++;
      });

      const topServices = Object.entries(serviceStats)
        .map(([service, stats]) => ({ service, count: stats.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Statistiche giornaliere
      const dailyStats: Record<string, { appointments: number }> = {};
      appointments.forEach(apt => {
        if (!dailyStats[apt.date]) {
          dailyStats[apt.date] = { appointments: 0 };
        }
        dailyStats[apt.date].appointments++;
      });

      const dailyStatsArray = Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, appointments: stats.appointments }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Statistiche clienti (semplificata per ora)
      const customerStats = {
        totalCustomers: customers.length,
        newCustomers: 0, // Da implementare con data di creazione
        returningCustomers: 0 // Da implementare con logica di ritorno
      };

      return {
        period: getPeriodLabel(selectedPeriod),
        totalAppointments: appointments.length,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledCount,
        noShowAppointments: noShowCount,
        topServices,
        dailyStats: dailyStatsArray,
        customerStats
      };
    };

    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calcola le date in base al periodo selezionato
        const now = new Date();
        let startDate: string, endDate: string;

        switch (selectedPeriod) {
          case 'current-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
          case 'last-month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
            break;
          case 'current-year':
            startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
            break;
          case 'last-3-months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        }

        // Fetch degli appuntamenti nel periodo
        const appointmentsRes = await fetch(`/api/appointments?startDate=${startDate}&endDate=${endDate}`);
        const appointments = await appointmentsRes.json();

        // Fetch dei clienti
        const customersRes = await fetch('/api/customers');
        const customers = await customersRes.json();

        // Processa i dati per il report
        const processedData = processReportData(appointments, customers);
        setReportData(processedData);

      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Errore nel caricamento dei dati del report');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [selectedPeriod]);

  const exportToCSV = () => {
    if (!reportData) return;

    let csv = 'REPORT GESTIONALE GRESILDA HAIRSTYLE\n';
    csv += `Periodo: ${reportData.period}\n`;
    csv += `Data di generazione: ${new Date().toLocaleDateString('it-IT')}\n\n`;
    
    csv += 'STATISTICHE GENERALI\n';
    csv += 'Indicatore,Valore\n';
    csv += `Appuntamenti Totali,${reportData.totalAppointments}\n`;
    csv += `Appuntamenti Completati,${reportData.completedAppointments}\n`;
    csv += `Appuntamenti Cancellati,${reportData.cancelledAppointments}\n`;
    csv += `Non Presentati,${reportData.noShowAppointments}\n`;
    csv += `Clienti Totali,${reportData.customerStats.totalCustomers}\n\n`;
    
    csv += 'SERVIZI PIÙ RICHIESTI\n';
    csv += 'Servizio,Prenotazioni\n';
    reportData.topServices.forEach(service => {
      csv += `${service.service},${service.count}\n`;
    });
    
    csv += '\nSTATISTICHE GIORNALIERE\n';
    csv += 'Data,Appuntamenti\n';
    reportData.dailyStats.forEach(day => {
      csv += `${day.date},${day.appointments}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report-gresilda-${reportData.period.replace(/\s/g, '-')}-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-pink-600">
              <BarChart3 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Caricamento report...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Report & Analisi</h1>
              <p className="text-gray-600">Statistiche e performance del salone</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Selettore Periodo */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full sm:w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">
                      {periods.find(p => p.value === selectedPeriod)?.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {periods.map(period => (
                      <button
                        key={period.value}
                        onClick={() => {
                          setSelectedPeriod(period.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-pink-50 first:rounded-t-lg last:rounded-b-lg ${
                          selectedPeriod === period.value ? 'bg-pink-50 text-pink-600 font-medium' : ''
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pulsante Export */}
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta CSV
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Appuntamenti Totali */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Appuntamenti Totali</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">{reportData.period}</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* Appuntamenti Completati */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completati</p>
                <p className="text-2xl font-bold text-green-600">{reportData.completedAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.totalAppointments > 0 ? 
                    `${((reportData.completedAppointments / reportData.totalAppointments) * 100).toFixed(1)}%` 
                    : '0%'} del totale
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Clienti Totali */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Clienti Totali</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.customerStats.totalCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">Nella tua anagrafica</p>
              </div>
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          {/* Tasso di Successo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasso di Successo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.totalAppointments > 0 ? 
                    `${((reportData.completedAppointments / reportData.totalAppointments) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Appuntamenti portati a termine</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Grafici e Tabelle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Servizi più richiesti */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-pink-600" />
              Servizi più Richiesti
            </h3>
            
            {reportData.topServices.length > 0 ? (
              <div className="space-y-4">
                {reportData.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{service.service}</span>
                        <span className="text-sm text-gray-600">{service.count} prenotazioni</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(service.count / Math.max(...reportData.topServices.map(s => s.count))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nessun dato disponibile per il periodo selezionato</p>
              </div>
            )}
          </div>

          {/* Statistiche giornaliere */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-pink-600" />
              Andamento Giornaliero
            </h3>
            
            {reportData.dailyStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">Data</th>
                      <th className="text-right py-2 text-gray-600 font-medium">Appuntamenti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.dailyStats.slice(-10).map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 text-gray-900">
                          {new Date(day.date).toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-medium text-gray-900">
                            {day.appointments}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nessun appuntamento nel periodo selezionato</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistiche di stato */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-pink-600" />
            Statistiche per Stato
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-800">{reportData.completedAppointments}</p>
              <p className="text-sm text-green-600">Completati</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-red-800">{reportData.cancelledAppointments}</p>
              <p className="text-sm text-red-600">Cancellati</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-orange-800">{reportData.noShowAppointments}</p>
              <p className="text-sm text-orange-600">Non presentati</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
