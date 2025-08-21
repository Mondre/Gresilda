export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Gestionale Gresilda</h1>
      <p>Environment Variables Test:</p>
      <ul>
        <li>USE_GOOGLE_SHEETS: {process.env.USE_GOOGLE_SHEETS || 'NOT SET'}</li>
        <li>CLIENT_EMAIL: {process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL ? 'SET' : 'NOT SET'}</li>
        <li>SPREADSHEET_ID: {process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'NOT SET'}</li>
      </ul>
    </div>
  )
}
