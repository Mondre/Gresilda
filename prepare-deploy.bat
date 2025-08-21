@echo off
echo 🚀 Preparazione Deploy - Gestionale Gresilda
echo =============================================

REM Controlla build
echo 🔨 Test build dell'applicazione...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Errore durante il build - controlla gli errori sopra
    pause
    exit /b 1
)

echo ✅ Build completata con successo
echo.
echo 🎯 PRONTO PER IL DEPLOY!
echo ========================
echo.
echo 📋 Prossimi passi:
echo 1. Push del codice su GitHub:
echo    git remote add origin https://github.com/TUO-USERNAME/gestionale-gresilda.git
echo    git push -u origin main
echo.
echo 2. Deploy su Vercel:
echo    - Vai su vercel.com/new
echo    - Importa da GitHub
echo    - Aggiungi environment variables
echo    - Deploy!
echo.
echo 📄 Leggi DEPLOY.md per istruzioni dettagliate
pause
