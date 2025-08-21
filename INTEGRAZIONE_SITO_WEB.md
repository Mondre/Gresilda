# 🌐 Integrazione Sito Web - Richieste Appuntamenti

## 📋 Come integrare il modulo del tuo sito web con il gestionale

### 1. **Endpoint API per ricevere richieste**
```
POST http://localhost:3000/api/appointment-requests
Content-Type: application/json
```

### 2. **Dati da inviare dal form del sito**
```javascript
{
  "nome": "Mario",                    // OBBLIGATORIO
  "cognome": "Rossi",                // Opzionale
  "telefono": "+39 123 456 7890",    // OBBLIGATORIO
  "email": "mario@example.com",      // Opzionale
  "servizio": "Taglio e piega",      // OBBLIGATORIO
  "data_preferita": "2025-08-25",    // OBBLIGATORIO (formato YYYY-MM-DD)
  "ora_preferita": "10:30",          // Opzionale (formato HH:MM)
  "note": "Preferisco il mattino"    // Opzionale
}
```

### 3. **Esempio di integrazione JavaScript**

#### Con fetch (Vanilla JavaScript):
```javascript
async function inviaRichiestaAppuntamento(formData) {
  try {
    const response = await fetch('http://localhost:3000/api/appointment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: formData.nome,
        cognome: formData.cognome,
        telefono: formData.telefono,
        email: formData.email,
        servizio: formData.servizio,
        data_preferita: formData.data_preferita,
        ora_preferita: formData.ora_preferita,
        note: formData.note
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('✅ Richiesta inviata con successo! Ti ricontatteremo presto.');
    } else {
      alert('❌ Errore: ' + result.error);
    }
  } catch (error) {
    alert('❌ Errore di connessione. Riprova più tardi.');
  }
}
```

#### Con jQuery:
```javascript
function inviaRichiestaAppuntamento(formData) {
  $.ajax({
    url: 'http://localhost:3000/api/appointment-requests',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(formData),
    success: function(response) {
      alert('✅ Richiesta inviata con successo!');
    },
    error: function(xhr) {
      const error = xhr.responseJSON?.error || 'Errore sconosciuto';
      alert('❌ Errore: ' + error);
    }
  });
}
```

### 4. **Esempio form HTML**
```html
<form id="appointment-form">
  <input type="text" name="nome" placeholder="Nome *" required>
  <input type="text" name="cognome" placeholder="Cognome">
  <input type="tel" name="telefono" placeholder="Telefono *" required>
  <input type="email" name="email" placeholder="Email">
  
  <select name="servizio" required>
    <option value="">Scegli servizio *</option>
    <option value="Taglio">Taglio</option>
    <option value="Piega">Piega</option>
    <option value="Taglio e Piega">Taglio e Piega</option>
    <option value="Colore">Colore</option>
    <option value="Meches">Meches</option>
    <option value="Trattamento">Trattamento</option>
  </select>
  
  <input type="date" name="data_preferita" required>
  <input type="time" name="ora_preferita">
  <textarea name="note" placeholder="Note aggiuntive"></textarea>
  
  <button type="submit">Richiedi Appuntamento</button>
</form>

<script>
document.getElementById('appointment-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  await inviaRichiestaAppuntamento(data);
});
</script>
```

### 5. **Per PRODUZIONE (quando pubblichi online)**
Sostituisci `http://localhost:3000` con il tuo dominio effettivo:
```javascript
const API_URL = 'https://tuodominio.com/api/appointment-requests';
```

### 6. **Gestione delle richieste nel gestionale**
- Le richieste appaiono nella **Dashboard** con stato "DA CONFERMARE"
- Vengono salvate automaticamente in **Google Sheets** (tab "Richieste")
- Puoi **confermare**, **rifiutare** o **chiamare** direttamente il cliente

### 7. **Sicurezza (per produzione)**
Per maggiore sicurezza, aggiungi:
```javascript
// Nel tuo file .env.local
ALLOWED_ORIGINS=https://tuosito.com,https://www.tuosito.com

// Nell'API (opzionale)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const origin = request.headers.get('origin');
if (origin && !allowedOrigins.includes(origin)) {
  return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
}
```

## 🎯 Vantaggi di questa integrazione:
- ✅ Richieste automatiche dal sito al gestionale
- ✅ Nessuna perdita di richieste via email
- ✅ Gestione centralizzata in Google Sheets
- ✅ Notifiche in tempo reale
- ✅ Storico completo delle richieste

## 🔧 Test dell'integrazione
Puoi testare l'API con curl:
```bash
curl -X POST http://localhost:3000/api/appointment-requests \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Cliente",
    "telefono": "123456789",
    "servizio": "Taglio",
    "data_preferita": "2025-08-25"
  }'
```

Se funziona, riceverai: `{"success": true, "message": "Richiesta appuntamento ricevuta con successo"}`
