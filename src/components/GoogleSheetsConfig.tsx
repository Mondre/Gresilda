'use client';

import { useState } from 'react';
import { 
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function GoogleSheetsConfig() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testResult, setTestResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Form state per le configurazioni
  const [config, setConfig] = useState({
    clientEmail: '',
    privateKey: '',
    projectId: '',
    spreadsheetId: ''
  });

  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/google-sheets?action=initialize');
      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({ type: 'success', message: 'Connessione Google Sheets funzionante!' });
        setIsConfigured(true);
      } else {
        setTestResult({ type: 'error', message: result.error || 'Errore nella connessione' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: 'Errore di connessione a Google Sheets' });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-pink-600" />
            Configurazione Google Sheets
          </h1>
          <p className="text-gray-600">
            Configura l'integrazione con Google Sheets per sincronizzare i dati tra più dispositivi
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stato Configurazione</h2>
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {testing ? 'Testando...' : 'Testa Connessione'}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg flex items-center mb-4 ${
              testResult.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {testResult.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {testResult.message}
            </div>
          )}

          <div className="flex items-center">
            {isConfigured ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Google Sheets configurato e funzionante</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">Configurazione richiesta</span>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Istruzioni Setup</h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-pink-600 hover:text-pink-700"
            >
              {showInstructions ? 'Nascondi' : 'Mostra'} Istruzioni
            </button>
          </div>

          {showInstructions && (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Guida Passo-Passo</h3>
                
                <ol className="space-y-3 list-decimal list-inside">
                  <li>
                    <strong>Accedi a Google Cloud Console</strong>
                    <div className="mt-1 flex items-center">
                      <a 
                        href="https://console.cloud.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        console.cloud.google.com <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Crea un nuovo progetto</strong> o seleziona uno esistente
                  </li>
                  
                  <li>
                    <strong>Abilita Google Sheets API</strong>
                    <div className="mt-1 text-gray-600">
                      Vai su "API e servizi" → "Libreria" → Cerca "Google Sheets API" → Abilita
                    </div>
                  </li>
                  
                  <li>
                    <strong>Crea un Service Account</strong>
                    <div className="mt-1 text-gray-600">
                      "API e servizi" → "Credenziali" → "Crea credenziali" → "Account di servizio"
                    </div>
                  </li>
                  
                  <li>
                    <strong>Genera chiave JSON</strong>
                    <div className="mt-1 text-gray-600">
                      Clicca sull'account di servizio → "Chiavi" → "Aggiungi chiave" → "JSON"
                    </div>
                  </li>
                  
                  <li>
                    <strong>Crea un Google Sheets</strong>
                    <div className="mt-1 flex items-center">
                      <a 
                        href="https://sheets.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        sheets.google.com <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Condividi il foglio</strong> con l'email del Service Account
                    <div className="mt-1 text-gray-600">
                      Dai permessi di modifica all'email che termina con @...iam.gserviceaccount.com
                    </div>
                  </li>
                  
                  <li>
                    <strong>Copia l'ID del foglio</strong>
                    <div className="mt-1 text-gray-600">
                      È la parte nell'URL: https://docs.google.com/spreadsheets/d/<strong>ID_QUI</strong>/edit
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h3>
                <ul className="space-y-1 list-disc list-inside text-yellow-800">
                  <li>Tieni al sicuro il file JSON delle credenziali</li>
                  <li>Non condividere mai le chiavi private</li>
                  <li>Il Service Account deve avere accesso al foglio Google</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sample .env content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">File .env.local</h2>
          <p className="text-sm text-gray-600 mb-4">
            Crea un file <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> nella root del progetto con questi valori:
          </p>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
            <button
              onClick={() => copyToClipboard(`# Google Sheets Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_PROJECT_ID=your-project-id
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id`)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <div className="space-y-1">
              <div># Google Sheets Configuration</div>
              <div>GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com</div>
              <div>GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"</div>
              <div>GOOGLE_SHEETS_PROJECT_ID=your-project-id</div>
              <div>GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Dopo aver creato il file .env.local, riavvia il server di sviluppo per applicare le modifiche.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
