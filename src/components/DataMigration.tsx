'use client';

import { useState } from 'react';
import { 
  Database, 
  CloudUpload, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function DataMigration() {
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    customers?: { success: boolean; count: number; message: string };
    appointments?: { success: boolean; count: number; message: string };
    products?: { success: boolean; count: number; message: string };
  }>({});

  const migrateData = async () => {
    setMigrating(true);
    setMigrationStatus({});

    try {
      // 1. Migra i clienti
      setMigrationStatus(prev => ({ ...prev, customers: { success: false, count: 0, message: 'Migrazione clienti in corso...' } }));
      
      const customersResponse = await fetch('/api/customers');
      const customers = await customersResponse.json();
      
      for (const customer of customers) {
        await fetch('/api/google-sheets?action=customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
      }
      
      setMigrationStatus(prev => ({ 
        ...prev, 
        customers: { success: true, count: customers.length, message: `${customers.length} clienti migrati con successo` }
      }));

      // 2. Migra gli appuntamenti
      setMigrationStatus(prev => ({ ...prev, appointments: { success: false, count: 0, message: 'Migrazione appuntamenti in corso...' } }));
      
      const appointmentsResponse = await fetch('/api/appointments');
      const appointments = await appointmentsResponse.json();
      
      for (const appointment of appointments) {
        await fetch('/api/google-sheets?action=appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointment)
        });
      }
      
      setMigrationStatus(prev => ({ 
        ...prev, 
        appointments: { success: true, count: appointments.length, message: `${appointments.length} appuntamenti migrati con successo` }
      }));

      // 3. Migra i prodotti
      setMigrationStatus(prev => ({ ...prev, products: { success: false, count: 0, message: 'Migrazione prodotti in corso...' } }));
      
      const productsResponse = await fetch('/api/products');
      const products = await productsResponse.json();
      
      for (const product of products) {
        await fetch('/api/google-sheets?action=product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      }
      
      setMigrationStatus(prev => ({ 
        ...prev, 
        products: { success: true, count: products.length, message: `${products.length} prodotti migrati con successo` }
      }));

    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      setMigrationStatus(prev => ({ 
        ...prev, 
        error: { success: false, count: 0, message: 'Errore durante la migrazione' }
      }));
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Migrazione Dati
        </h2>
        <p className="text-sm text-gray-600">
          Trasferisci tutti i dati esistenti dal database locale a Google Sheets
        </p>
      </div>

      <div className="space-y-4">
        {/* Status migrazione */}
        {Object.keys(migrationStatus).length > 0 && (
          <div className="space-y-3">
            {migrationStatus.customers && (
              <div className={`p-3 rounded-lg flex items-center ${
                migrationStatus.customers.success 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-blue-50 text-blue-800'
              }`}>
                {migrationStatus.customers.success ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                )}
                {migrationStatus.customers.message}
              </div>
            )}

            {migrationStatus.appointments && (
              <div className={`p-3 rounded-lg flex items-center ${
                migrationStatus.appointments.success 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-blue-50 text-blue-800'
              }`}>
                {migrationStatus.appointments.success ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                )}
                {migrationStatus.appointments.message}
              </div>
            )}

            {migrationStatus.products && (
              <div className={`p-3 rounded-lg flex items-center ${
                migrationStatus.products.success 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-blue-50 text-blue-800'
              }`}>
                {migrationStatus.products.success ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                )}
                {migrationStatus.products.message}
              </div>
            )}
          </div>
        )}

        {/* Avviso importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">⚠️ Importante prima della migrazione:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Assicurati che Google Sheets sia configurato correttamente</li>
                <li>I dati verranno AGGIUNTI al foglio, non sostituiti</li>
                <li>Fai un backup del database locale prima di procedere</li>
                <li>La migrazione potrebbe richiedere alcuni minuti</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Processo di migrazione */}
        <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Database className="w-8 h-8 text-gray-600" />
                  <span className="ml-2 text-sm font-medium text-gray-600">SQLite</span>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex items-center">
                  <CloudUpload className="w-8 h-8 text-green-600" />
                  <span className="ml-2 text-sm font-medium text-gray-600">Google Sheets</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={migrateData}
              disabled={migrating}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Migrazione in corso...
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4 mr-2" />
                  Inizia Migrazione
                </>
              )}
            </button>
            
            {!migrating && (
              <p className="text-xs text-gray-500 mt-2">
                Clicca per trasferire tutti i dati a Google Sheets
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
