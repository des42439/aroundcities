@echo off

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set TS=%%i

set ZIPNAME=%TS%_backup.zip

:: Delete existing zip if it exists
if exist "%ZIPNAME%" del "%ZIPNAME%"

powershell -Command ^
"Compress-Archive -Path 'app','components','lib','types','public','.env.local','package.json','table_design.sql','tsconfig.json' -DestinationPath '%ZIPNAME%'"

echo Created %ZIPNAME%
pause
