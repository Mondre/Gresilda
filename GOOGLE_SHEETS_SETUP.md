# 🚀 Guida Completa Google Sheets Integration

## Panoramica
Questa guida ti aiuterà a configurare l'integrazione di Google Sheets con il tuo gestionale, permettendoti di:
- ✅ Sincronizzare i dati tra più computer
- ✅ Avere un backup automatico su Google Drive  
- ✅ Accedere ai dati da qualsiasi dispositivo
- ✅ Collaborare con altri utenti

---

## 📋 Prerequisiti
- Account Google
- Accesso a Google Cloud Console
- File .env.local nel progetto

---

## 🔧 Setup Passo-Passo

### 1. Accesso Google Cloud Console
1. Vai su [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Accedi con il tuo account Google
3. Accetta i termini di servizio se richiesto

### 2. Creazione Progetto
1. Clicca su **"Seleziona un progetto"** in alto
2. Clicca su **"Nuovo progetto"**
3. Inserisci nome progetto: `Gestionale-Gresilda`
4. Clicca **"Crea"**

### 3. Abilitazione Google Sheets API
1. Nel menu a sinistra, vai su **"API e servizi" → "Libreria"**
2. Cerca **"Google Sheets API"**
3. Clicca sul risultato e poi **"Abilita"**
4. Attendi l'attivazione

### 4. Creazione Service Account
1. Vai su **"API e servizi" → "Credenziali"**
2. Clicca **"Crea credenziali" → "Account di servizio"**
3. Compila i campi:
   - **Nome**: `gestionale-sheets-service`
   - **ID**: `gestionale-sheets-service` (auto-generato)
   - **Descrizione**: `Service account per gestionale Gresilda`
4. Clicca **"Crea e continua"**
5. Salta i passaggi opzionali cliccando **"Fine"**

### 5. Generazione Chiave JSON
1. Nella lista credenziali, trova il tuo service account
2. Clicca sull'email del service account
3. Vai alla tab **"Chiavi"**
4. Clicca **"Aggiungi chiave" → "Crea nuova chiave"**
5. Seleziona **"JSON"** e clicca **"Crea"**
6. **IMPORTANTE**: Salva il file JSON in un posto sicuro

### 6. Creazione Google Sheets
1. Vai su [https://sheets.google.com/](https://sheets.google.com/)
2. Clicca **"Crea"** per nuovo foglio
3. Rinomina il foglio in **"Gestionale Gresilda"**
4. Crea 3 fogli (tab in basso):
   - **Clienti**
   - **Appuntamenti** 
   - **Prodotti**

### 7. Condivisione Foglio
1. Clicca **"Condividi"** in alto a destra
2. Inserisci l'email del service account (dal file JSON: `client_email`)
3. Seleziona **"Editor"** come ruolo
4. **DESELEZIONA** "Invia notifica"
5. Clicca **"Condividi"**

### 8. Copia ID Spreadsheet
Dall'URL del foglio copia l'ID:
```
https://docs.google.com/spreadsheets/d/[QUI_C'È_L'ID]/edit
```

---

## ⚙️ Configurazione File .env.local

Crea il file `.env.local` nella root del progetto:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=tuo-service-account@tuo-progetto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLaTuaChiavePrivataQui\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_PROJECT_ID=tuo-project-id
GOOGLE_SHEETS_SPREADSHEET_ID=id-del-tuo-foglio-google
```

### Come ottenere i valori:
- **CLIENT_EMAIL**: Campo `client_email` dal file JSON
- **PRIVATE_KEY**: Campo `private_key` dal file JSON (mantieni le `\n`)
- **PROJECT_ID**: Campo `project_id` dal file JSON  
- **SPREADSHEET_ID**: ID dall'URL del foglio Google

---

## 🧪 Test Configurazione

1. Riavvia il server di sviluppo
2. Vai alla sezione **"Google Sheets"** nel gestionale
3. Clicca **"Testa Connessione"**
4. Dovresti vedere: ✅ **"Connessione Google Sheets funzionante!"**

---

## 📊 Struttura Fogli

Il sistema creerà automaticamente le intestazioni:

### Foglio "Clienti"
| Nome | Cognome | Telefono | Email | Compleanno | Note |

### Foglio "Appuntamenti"  
| ID Cliente | Nome Cliente | Telefono | Data | Ora | Servizio | Durata | Stato | Note |

### Foglio "Prodotti"
| Nome | Marca | Categoria | Quantità | Quantità Min | Prezzo Acquisto | Prezzo Vendita | Scadenza | Note |

---

## 🔄 Migrazione Dati Esistenti

Se hai già dati nel database SQLite:

1. **Backup**: Fai una copia del database esistente
2. **Export**: Esporta i dati dal gestionale 
3. **Import**: Incolla i dati nei rispettivi fogli Google
4. **Test**: Verifica che tutto funzioni

---

## ⚠️ Troubleshooting

### Errore "Permission denied"
- Verifica che il service account abbia accesso al foglio
- Controlla che l'email sia corretta nel file .env.local

### Errore "Invalid credentials" 
- Verifica che la PRIVATE_KEY sia formattata correttamente
- Assicurati che le credenziali nel .env.local siano aggiornate

### Errore "Spreadsheet not found"
- Controlla che SPREADSHEET_ID sia corretto
- Verifica che il foglio sia condiviso con il service account

### Server non si avvia
- Riavvia il server dopo aver modificato .env.local
- Controlla la sintassi del file .env.local

---

## 🔒 Sicurezza

**IMPORTANTE - Mantieni al sicuro:**
- ❌ Non condividere mai il file JSON delle credenziali
- ❌ Non committare mai .env.local su Git
- ❌ Non inviare le chiavi private via email/chat
- ✅ Usa file .env.local per credenziali
- ✅ Aggiungi .env.local al .gitignore
- ✅ Fai backup sicuri delle credenziali

---

## 🎯 Vantaggi

✅ **Multi-dispositivo**: Accesso da qualsiasi computer  
✅ **Backup automatico**: I dati sono al sicuro su Google Drive  
✅ **Collaborazione**: Più persone possono usare il gestionale  
✅ **Sincronizzazione**: Aggiornamenti in tempo reale  
✅ **Scalabilità**: Supporta crescita del business

---

## 📞 Supporto

Se hai problemi:
1. Controlla questa guida
2. Verifica la sezione Troubleshooting  
3. Testa la connessione dal gestionale
4. Controlla i log del server per errori dettagliati

**Buon lavoro! 🎉**
