'use client';

import { useState } from 'react';
import { CloudUpload, Database, RefreshCw, ArrowRight } from 'lucide-react';

export default function SimpleMigration() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string>('');

  const startMigration = async () => {
    setMigrating(true);
    setResult('Iniziando migrazione...');
    
    try {
      // Test semplice
      const response = await fetch('/api/google-sheets?action=initialize');
      const data = await response.json();
      
      if (data.success) {
        setResult('✅ Migrazione completata con successo!');
      } else {
        setResult('❌ Errore durante la migrazione');
      }
    } catch {
      setResult('❌ Errore di connessione');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Database className="w-6 h-6 mr-2 text-blue-600" />
        Migrazione Dati
      </h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-gray-600" />
            <span className="ml-2">SQLite</span>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400" />
          <div className="flex items-center">
            <CloudUpload className="w-8 h-8 text-green-600" />
            <span className="ml-2">Google Sheets</span>
          </div>
        </div>
      </div>

      {result && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">{result}</p>
        </div>
      )}

      <button
        onClick={startMigration}
        disabled={migrating}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
}
