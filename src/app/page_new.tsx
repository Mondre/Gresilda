'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import CustomerManager from '@/components/CustomerManager';
import InventoryManager from '@/components/InventoryManager';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <AppointmentCalendar />;
      case 'customers':
        return <CustomerManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'reports':
        return (
          <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Report</h1>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">
                La sezione Report sarà disponibile prossimamente.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Qui potrai visualizzare statistiche dettagliate su appuntamenti, clienti e vendite.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
