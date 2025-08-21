# 🔥 GUIDA RAPIDA - Configura Google Sheets in 10 minuti!

## 📋 Quello che devi fare

### STEP 1: Crea il progetto Google (5 minuti)
1. **Vai su**: https://console.cloud.google.com/
2. **Accedi** con il tuo account Google
3. **Clicca** "Seleziona progetto" → "Nuovo progetto"
4. **Nome progetto**: `Gestionale-Gresilda`
5. **Clicca** "Crea"

### STEP 2: Abilita Google Sheets (2 minuti)
1. **Nel menu a sinistra**: "API e servizi" → "Libreria"
2. **Cerca**: "Google Sheets API"  
3. **Clicca** sul risultato → "Abilita"

### STEP 3: Crea le credenziali (2 minuti)
1. **Vai su**: "API e servizi" → "Credenziali"
2. **Clicca**: "Crea credenziali" → "Account di servizio"
3. **Nome**: `gestionale-sheets-service`
4. **Clicca**: "Crea e continua" → "Fine"
5. **Clicca** sull'email del service account appena creato
6. **Tab "Chiavi"** → "Aggiungi chiave" → "Crea nuova chiave"
7. **Seleziona** "JSON" → "Crea"
8. **SALVA IL FILE JSON!** 🔐

### STEP 4: Crea il Google Sheets (1 minuto)
1. **Vai su**: https://sheets.google.com/
2. **Crea** nuovo foglio
3. **Rinomina** in "Gestionale Gresilda" 
4. **Crea 3 tab**: "Clienti", "Appuntamenti", "Prodotti"
5. **Copia l'ID dall'URL** (la parte lunga tra /d/ e /edit)

### STEP 5: Condividi il foglio (1 minuto)  
1. **Clicca** "Condividi" nel foglio
2. **Incolla** l'email dal file JSON (quella che finisce con @...iam.gserviceaccount.com)
3. **Seleziona** "Editor"
4. **DESELEZIONA** "Invia notifica"
5. **Clicca** "Condividi"

## 📝 Ora aggiorna il file .env.local

**Apri il file** `.env.local` (che ho già creato) e **sostituisci questi valori**:

```bash
# ✏️ SOSTITUISCI QUESTI CON I TUOI VALORI:

# Dal file JSON → campo "client_email" 
GOOGLE_SHEETS_CLIENT_EMAIL=la-tua-email-service@progetto-123456.iam.gserviceaccount.com

# Dal file JSON → campo "private_key" (copia tutto, anche -----BEGIN e -----END)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLaTuaLungaChiaveQui...\n-----END PRIVATE KEY-----\n"

# Dal file JSON → campo "project_id"
GOOGLE_SHEETS_PROJECT_ID=il-tuo-progetto-id-123456

# Dall'URL del Google Sheets → la parte tra /d/ e /edit
GOOGLE_SHEETS_SPREADSHEET_ID=1ABCxyz123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## 🧪 Testa che funzioni

1. **Riavvia** il server: `Ctrl+C` e poi `npm run dev`
2. **Vai** alla sezione "Google Sheets" nel gestionale  
3. **Clicca** "Testa Connessione"
4. **Dovrebbe apparire**: ✅ "Connessione Google Sheets funzionante!"

## ❓ Se non funziona

- **Errore credenziali**: Controlla che hai copiato bene i valori dal JSON
- **Errore permessi**: Assicurati di aver condiviso il foglio con il service account
- **Errore ID foglio**: Controlla l'ID dall'URL del Google Sheets

## 🎯 Risultato finale

Una volta configurato:
- ✅ I dati saranno salvati su Google Sheets
- ✅ Potrai usare il gestionale da più computer
- ✅ I dati saranno sempre sincronizzati
- ✅ Backup automatico su Google Drive

**Sei pronto! 🚀**
