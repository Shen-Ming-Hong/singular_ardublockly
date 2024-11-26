@echo off
setlocal

rem Set variables
set "DOWNLOAD_URL=https://github.com/Shen-Ming-Hong/singular_ardublockly/archive/refs/heads/main.zip"
set "TARGET_DIR=%~dp0Singular"
set "TEMP_ZIP=%TEMP%\main.zip"
set "EXTRACT_DIR=%TEMP%\extracted"

rem Create the Singular folder if it doesn't exist
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
)

rem Clear the contents of the Singular folder
echo Clearing the Singular folder...
del /q "%TARGET_DIR%\*.*"
for /d %%D in ("%TARGET_DIR%\*") do rd /s /q "%%D"

rem Use PowerShell to download the latest version of the ZIP file
echo Downloading the latest version of the ZIP file...
PowerShell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TEMP_ZIP%'"
if %ERRORLEVEL% neq 0 (
    echo Download failed. Please check your network connection or the download URL.
    goto :END
)

rem Use PowerShell to extract the ZIP file to a temporary folder
echo Extracting the ZIP file to a temporary folder...
if exist "%EXTRACT_DIR%" (
    rd /s /q "%EXTRACT_DIR%"
)
mkdir "%EXTRACT_DIR%"
PowerShell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%EXTRACT_DIR%' -Force"
if %ERRORLEVEL% neq 0 (
    echo Extraction failed. Please ensure your PowerShell version supports Expand-Archive.
    goto :END
)

rem Move the contents of the extracted folder to the target folder
echo Moving extracted files to the target folder...
for /d %%D in ("%EXTRACT_DIR%\*") do (
    move "%%D\*" "%TARGET_DIR%\"
)

rem Clean up temporary files
rd /s /q "%EXTRACT_DIR%"
del "%TEMP_ZIP%"

echo Update complete!

:END
endlocal
pause
