'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import OutlookCalendar from '@/components/OutlookCalendar';
import CustomerManager from '@/components/CustomerManager';
import InventoryManager from '@/components/InventoryManager';
import Reports from '@/components/Reports';
import GoogleSheetsConfig from '@/components/GoogleSheetsConfig';
import CustomerHistory from '@/components/CustomerHistory';
import AppointmentRequests from '@/components/AppointmentRequests';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <OutlookCalendar />;
      case 'customers':
        return <CustomerManager />;
      case 'customer-history':
        return <CustomerHistory />;
      case 'inventory':
        return <InventoryManager />;
      case 'reports':
        return <Reports />;
      case 'google-sheets':
        return <GoogleSheetsConfig />;
      case 'appointment-requests':
        return <AppointmentRequests />;
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
