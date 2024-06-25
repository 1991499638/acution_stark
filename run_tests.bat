@echo off
setlocal enabledelayedexpansion

for /l %%i in (1,1,100) do (
    echo Running npm run test, iteration %%i
    npm run test
    echo Waiting for 1 seconds...
    timeout /t 1 /nobreak > nul
)

endlocal
