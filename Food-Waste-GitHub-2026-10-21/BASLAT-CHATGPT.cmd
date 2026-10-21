@echo off
cd /d "%~dp0"
set "FOODWASTE_NODE=C:\Users\YOUR_USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo Food ^& Waste MCP - yalnizca yerel demo baglantisi
echo Once ana uygulamayi BASLAT.cmd ile acin.
echo Yerel MCP: http://127.0.0.1:3102/mcp
echo Bu adres tek basina ChatGPT web baglantisi degildir. CHATGPT-KURULUM.md dosyasina bakin.
if exist "%FOODWASTE_NODE%" (
  "%FOODWASTE_NODE%" chatgpt/server.mjs
) else (
  node chatgpt/server.mjs
)
pause
