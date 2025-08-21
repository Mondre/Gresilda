# Gestionale Gresilda Hairstyle 💇‍♀️

Un gestionale web moderno per il salone di parrucchiera "Gresilda Hairstyle", sviluppato con Next.js, React, TypeScript e SQLite.

## ✨ Funzionalità

### 📅 Calendario Appuntamenti
- Visualizzazione appuntamenti per data
- Creazione e modifica appuntamenti
- Gestione stati (programmato, completato, annullato, non presentato)
- Associazione clienti e servizi
- Note personalizzate

### 👥 Gestione Clienti
- Anagrafica completa (nome, cognome, telefono, compleanno)
- Ricerca per nome e telefono
- Alert automatici per compleanni
- Note personalizzate per ogni cliente
- Storia appuntamenti

### 📦 Magazzino
- Gestione prodotti e stock
- Alert per scorte basse
- Alert per prodotti in scadenza
- Categorizzazione prodotti
- Gestione prezzi acquisto/vendita

### 📊 Dashboard
- Panoramica appuntamenti giornalieri
- Statistiche clienti totali
- Monitoraggio scorte basse
- Calcolo incassi mensili
- Appuntamenti prossimi
- Azioni rapide

## 🚀 Tecnologie

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite con sqlite3
- **Icons**: Lucide React
- **Build Tool**: Next.js con App Router

## 📋 Prerequisiti

- Node.js 18.0 o superiore
- npm o yarn

## 🛠️ Installazione

1. Clona il repository:
```bash
git clone <repository-url>
cd gestionale-gresilda
```

2. Installa le dipendenze:
```bash
npm install
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

4. Apri [http://localhost:3000](http://localhost:3000) nel browser

## 📁 Struttura del Progetto

```
src/
├── app/
│   ├── api/          # API Routes
│   │   ├── appointments/
│   │   ├── customers/
│   │   ├── products/
│   │   └── services/
│   └── page.tsx      # Pagina principale
├── components/       # Componenti React
│   ├── AppointmentCalendar.tsx
│   ├── CustomerManager.tsx
│   ├── InventoryManager.tsx
│   ├── Dashboard.tsx
│   └── Navigation.tsx
├── lib/
│   ├── database.ts   # Configurazione SQLite
│   └── utils.ts      # Utility functions
└── types/
    └── index.ts      # TypeScript definitions
```

## 🗃️ Database

Il database SQLite viene inizializzato automaticamente al primo avvio con le seguenti tabelle:

- `customers` - Anagrafica clienti
- `appointments` - Appuntamenti
- `products` - Magazzino prodotti  
- `services` - Servizi disponibili

## 📱 Responsive Design

L'applicazione è completamente responsive e ottimizzata per:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design System

- **Colore primario**: Pink/Rosa (theme parrucchiera)
- **Tipografia**: System fonts con Geist
- **Icone**: Lucide React per consistenza
- **Layout**: Cards e grid responsive

## 🔧 Scripts Disponibili

```bash
npm run dev          # Server di sviluppo
npm run build        # Build per produzione
npm run start        # Server di produzione
npm run lint         # Linting del codice
```

## 📈 Prossimi Sviluppi

- [ ] Sistema di promemoria automatici (SMS/Email)
- [ ] Report dettagliati e analytics
- [ ] Gestione pagamenti e fatturazione
- [ ] Backup automatico database
- [ ] Notifiche push per appuntamenti
- [ ] Gestione orari di lavoro e ferie

## 🤝 Contributi

Per miglioramenti e suggerimenti, apri una issue o invia una pull request.

## 📄 Licenza

Questo progetto è sviluppato per uso privato del salone "Gresilda Hairstyle".
