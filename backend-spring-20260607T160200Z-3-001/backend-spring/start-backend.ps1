# Script de demarrage du backend Spring Boot
# Connexion : PostgreSQL localhost:5432, user=postgres, password=qasmieee

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Demarrage du backend Spring Boot..." -ForegroundColor Cyan
Write-Host "URL : http://localhost:8080" -ForegroundColor Green
Write-Host "Base de donnees : gestion_clinique (localhost:5432)" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arreter." -ForegroundColor Yellow
Write-Host ""

java -jar "target\backend-spring-0.0.1-SNAPSHOT.jar"
