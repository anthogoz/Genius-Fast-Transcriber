@echo off
REM =====================================================
REM Build Chrome Web Store ZIP
REM Automatically reads version from manifest.json
REM Creates "Genius Fast Transcriber vX.X.X.zip"
REM =====================================================

echo.
echo ========================================
echo   Genius Fast Transcriber
echo   Chrome Web Store Builder
echo ========================================
echo.

REM Run the build script
npm run package:chrome

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
pause
