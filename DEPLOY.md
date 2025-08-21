# 🚀 Guida Deploy - Gestionale Gresilda

## 📋 Preparazione Pre-Deploy

### 1. Controlla i file necessari
- ✅ `package.json` - dipendenze corrette
- ✅ `.env.local` - variabili d'ambiente (NON committare!)
- ✅ `next.config.js` - configurazione Next.js
- ✅ File di progetto completi

### 2. Variabili d'ambiente da configurare
```bash
USE_GOOGLE_SHEETS=true
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=gestionale-sheets-service@gestionale-gresilda.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_ID=1wxf99OivDJbjX50VQ2fQwIdM_e5vinHdfD9-Sah075g
GOOGLE_SHEETS_PROJECT_ID=gestionale-gresilda
GOOGLE_SHEETS_SPREADSHEET_ID=1wxf99OivDJbjX50VQ2fQwIdM_e5vinHdfD9-Sah075g
```

## 🎯 Opzioni di Deploy

### 🥇 VERCEL (Raccomandato)
✅ **Perfetto per Next.js** - Creato dalla stessa azienda
✅ **API Routes supportate** - Tutte le funzioni funzioneranno
✅ **Deploy automatico** - Push su GitHub = deploy automatico
✅ **Gestione environment variables**
✅ **SSL gratuito**
✅ **CDN globale**

**Passi:**
1. Vai su [vercel.com](https://vercel.com)
2. Connetti il tuo account GitHub
3. Importa il repository
4. Aggiungi le variabili d'ambiente
5. Deploy automatico!

### ⚠️ NETLIFY (Limitazioni)
⚠️ **Problemi con API Routes** - Netlify non supporta completamente le API di Next.js
⚠️ **Richiede Netlify Functions** - Configurazione complessa
⚠️ **Possibili problemi database** - SQLite non supportato nativamente

**Solo se adatti il codice:**
- Converti API Routes in Netlify Functions
- Usa database esterno (non SQLite)
- Configurazione aggiuntiva necessaria

### 🔧 RAILWAY (Alternativa completa)
✅ **Supporto completo Node.js**
✅ **Database incluso**
✅ **Configurazione semplice**
✅ **Piano gratuito disponibile**

### 🔧 RENDER (Alternativa)
✅ **Supporto completo Next.js**
✅ **Database PostgreSQL incluso**
✅ **SSL automatico**

## 🚀 Deploy Rapido con Vercel

### Passo 1: GitHub
```bash
# Inizializza git (se non fatto)
git init
git add .
git commit -m "Initial commit"

# Push su GitHub
git remote add origin https://github.com/tuo-username/gestionale-gresilda.git
git push -u origin main
```

### Passo 2: Vercel
1. Vai su [vercel.com/new](https://vercel.com/new)
2. Connetti GitHub
3. Seleziona il repository "gestionale-gresilda"
4. Configura:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Passo 3: Environment Variables
Aggiungi in Vercel Dashboard > Settings > Environment Variables:
```
USE_GOOGLE_SHEETS = true
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL = [il tuo email]
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = [la tua chiave]
GOOGLE_SHEETS_ID = [il tuo sheet ID]
```

### Passo 4: Deploy
- Click "Deploy"
- Aspetta ~2 minuti
- Il tuo gestionale è online! 🎉

## ⚡ Deploy Alternativo - Railway

1. Vai su [railway.app](https://railway.app)
2. "Deploy from GitHub repo"
3. Connetti repository
4. Aggiungi variabili d'ambiente
5. Deploy automatico

## 🔒 Sicurezza

### ⚠️ IMPORTANTE
- **NON committare `.env.local`** su GitHub
- **Usa variabili d'ambiente** su Vercel/Railway
- **Mantieni private** le credenziali Google Sheets
- **Controlla** che `.env.local` sia in `.gitignore`

### Controllo .gitignore
Il file deve contenere:
```
.env.local
.env
```

## 🆘 Troubleshooting

### Errore "Environment variables not found"
- Controlla di aver aggiunto tutte le variabili
- Restart deploy dopo aver aggiunto variabili

### Errore Google Sheets API
- Verifica che la chiave privata sia completa
- Controlla che il Service Account abbia accesso al foglio
- Assicurati che USE_GOOGLE_SHEETS=true

### Build fallito
```bash
# Test build locale
npm run build

# Se fallisce, controlla errori TypeScript
npm run type-check
```

## 🎯 Raccomandazione Finale

**Usa VERCEL** - È l'opzione migliore per il tuo progetto Next.js:
- Deploy in 5 minuti
- Tutto funziona out-of-the-box  
- Performance ottimali
- Supporto tecnico eccellente

Netlify richiederebbe troppe modifiche al codice esistente.
