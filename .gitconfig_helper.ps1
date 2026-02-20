# Script auxiliar para facilitar el uso de Git en Windows
# Configuración del PATH para usar Git sin ruta completa

# Añadir Git al PATH de la sesión actual
$gitPath = "C:\Program Files\Git\bin"
if ($env:Path -notlike "*$gitPath*") {
    $env:Path += ";$gitPath"
}

Write-Host "✅ Git configurado correctamente en esta sesión de PowerShell" -ForegroundColor Green
Write-Host ""
Write-Host "🔹 Ahora puedes usar comandos Git directamente:" -ForegroundColor Cyan
Write-Host "   git status" -ForegroundColor Yellow
Write-Host "   git branch" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host "   git commit -m 'mensaje'" -ForegroundColor Yellow
Write-Host "   git push origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "📂 Directorio actual: $(Get-Location)" -ForegroundColor Cyan

# Mostrar estado del repositorio
if (Test-Path ".git") {
    Write-Host ""
    Write-Host "📊 Estado del repositorio:" -ForegroundColor Magenta
    & git status --short
    Write-Host ""
    & git branch
} else {
    Write-Host ""
    Write-Host "⚠️  No estás en un directorio de Git" -ForegroundColor Yellow
    Write-Host "   Navega a: d:\GitHub\plantillaWeb_b5" -ForegroundColor Yellow
}
