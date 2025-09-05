Write-Host "🚀 Starting College Cash Swap Application..." -ForegroundColor Green
Write-Host ""

Write-Host "📱 Starting Backend Server..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
Set-Location ..

Write-Host ""
Write-Host "🌐 Starting Frontend..." -ForegroundColor Yellow
Write-Host "Opening frontend/index.html in your default browser..."
Start-Process "frontend/index.html"

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: frontend/index.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Make sure you have:" -ForegroundColor Yellow
Write-Host "   - MongoDB running"
Write-Host "   - .env file configured in backend folder"
Write-Host "   - All dependencies installed (npm install in backend folder)"
Write-Host ""
Read-Host "Press Enter to continue..." 