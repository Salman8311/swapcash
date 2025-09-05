@echo off
echo 🚀 Starting College Cash Swap Application...
echo.

echo 📱 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo 🌐 Starting Frontend...
echo Opening frontend/index.html in your default browser...
start frontend/index.html

echo.
echo ✅ Application started successfully!
echo.
echo 📍 Backend: http://localhost:3000
echo 🌐 Frontend: frontend/index.html
echo.
echo 💡 Make sure you have:
echo    - MongoDB running
echo    - .env file configured in backend folder
echo    - All dependencies installed (npm install in backend folder)
echo.
pause 