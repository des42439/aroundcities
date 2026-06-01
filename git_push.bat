@echo off

echo Building project...
call npm run build

if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

echo Build successful.
git add .

set /p COMMIT_MSG=Enter commit message:

git commit -m "%COMMIT_MSG%"
git push

echo Done.
