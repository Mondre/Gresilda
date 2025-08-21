import GoogleSheetsConfig from '@/components/GoogleSheetsConfig';
import SimpleMigration from '@/components/SimpleMigration';

export default function GoogleSheetsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Google Sheets Integration
        </h1>
        <p className="text-gray-600">
          Configura e gestisci la sincronizzazione con Google Sheets per accesso multi-dispositivo
        </p>
      </div>

      <div className="space-y-6">
        <GoogleSheetsConfig />
        <SimpleMigration />
      </div>
    </div>
  );
}
