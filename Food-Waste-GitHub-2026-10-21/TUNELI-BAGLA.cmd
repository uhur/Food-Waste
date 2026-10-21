@echo off
cd /d "%~dp0"
set "FOODWASTE_PWSH=C:\Users\YOUR_USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe"
if exist "%FOODWASTE_PWSH%" (
  "%FOODWASTE_PWSH%" -NoProfile -File "%~dp0TUNELI-BAGLA.ps1"
) else (
  powershell.exe -NoProfile -File "%~dp0TUNELI-BAGLA.ps1"
)
pause
