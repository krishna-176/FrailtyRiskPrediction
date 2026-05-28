@echo off
echo Starting ML Service with OpenAI recommendations enabled...
cd /d "D:\New folder (3)\ml-service"
call venv\Scripts\activate
uvicorn api.main:app --host 0.0.0.0 --port 8000
