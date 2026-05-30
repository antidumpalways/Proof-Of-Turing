@echo off
cd /d C:\Users\Acer\Downloads\Proof-Of-Turing-main\backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
