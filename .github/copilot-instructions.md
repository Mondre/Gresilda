<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Gestionale Gresilda Hairstyle - Copilot Instructions

Questo è un gestionale web per il salone di parrucchiera "Gresilda Hairstyle" sviluppato con:

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite con driver sqlite3
- **UI Components**: Lucide React icons, componenti custom

## Struttura del Progetto

- `src/app/api/` - API endpoints per CRUD operations
- `src/components/` - Componenti React riutilizzabili
- `src/lib/` - Utility e configurazione database
- `src/types/` - Definizioni TypeScript
- `database/` - File database SQLite

## Funzionalità Principali

1. **Gestione Appuntamenti** - Calendario con visualizzazione e prenotazioni
2. **Anagrafica Clienti** - CRUD clienti con gestione compleanni
3. **Magazzino** - Gestione prodotti con alerts per scorte basse e scadenze
4. **Dashboard** - Overview con statistiche e azioni rapide

## Convenzioni di Codice

- Utilizzare TypeScript strict mode
- Componenti React funzionali con hooks
- API Routes con proper error handling
- Stili Tailwind CSS con pattern responsive
- Icone Lucide React per consistenza visiva
- Colore principale: Pink (per brand parrucchiera)

## Database Schema

- `customers` - Clienti (nome, cognome, telefono, compleanno, note)
- `appointments` - Appuntamenti (cliente, data, ora, servizio, prezzo, stato)
- `products` - Prodotti magazzino (nome, marca, categoria, prezzi, quantità, scadenza)
- `services` - Servizi disponibili (nome, durata, prezzo)

## Best Practices

- Sempre gestire loading states e error handling
- Validare input lato client e server
- Utilizzare proper TypeScript types
- Mantenere componenti piccoli e riutilizzabili
- Implementare responsive design con Tailwind
- Seguire convenzioni di naming italiane per UI (cliente finale italiana)
