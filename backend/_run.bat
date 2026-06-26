@echo off
cd /d C:\shahrukh\welovepdf\backend
start "welovepdf-backend" /B cmd /c "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload > uvicorn.log 2>&1"
echo backend launched
