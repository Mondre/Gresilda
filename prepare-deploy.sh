#!/bin/bash

echo "🚀 Preparazione Deploy - Gestionale Gresilda"
echo "============================================="

# Controlla se è un repository git
if [ ! -d ".git" ]; then
    echo "📁 Inizializzo repository Git..."
    git init
    git add .
    git commit -m "Initial commit - Gestionale Gresilda Hairstyle"
    echo "✅ Repository Git inizializzato"
else
    echo "✅ Repository Git già esistente"
fi

# Controlla build
echo "🔨 Test build dell'applicazione..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completata con successo"
else
    echo "❌ Errore durante il build - controlla gli errori sopra"
    exit 1
fi

echo ""
echo "🎯 PRONTO PER IL DEPLOY!"
echo "========================"
echo ""
echo "📋 Prossimi passi:"
echo "1. Push del codice su GitHub:"
echo "   git remote add origin https://github.com/TUO-USERNAME/gestionale-gresilda.git"
echo "   git push -u origin main"
echo ""
echo "2. Deploy su Vercel:"
echo "   - Vai su vercel.com/new"
echo "   - Importa da GitHub"
echo "   - Aggiungi environment variables"
echo "   - Deploy!"
echo ""
echo "📄 Leggi DEPLOY.md per istruzioni dettagliate"
