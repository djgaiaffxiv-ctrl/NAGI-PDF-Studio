# ============================================================
#  Nagi PDF Studio — instalador
#  Copia la app + accesos directos (tu usuario) y anade el menu
#  del clic derecho en HKLM (pide admin UNA vez, igual que Nitro).
# ============================================================
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Source      = Join-Path $ProjectRoot "dist-installer\win-unpacked"
$InstallDir  = Join-Path $env:LOCALAPPDATA "Programs\Nagi PDF Studio"
$Exe         = Join-Path $InstallDir "Nagi PDF Studio.exe"
$BuildDir    = Join-Path $ProjectRoot "build"

if (-not (Test-Path $Source)) { throw "No encuentro la app empaquetada en: $Source. Ejecuta antes 'npm run dist' (o el build)." }

Write-Host "Cerrando la app si esta abierta..."
Get-Process "Nagi PDF Studio" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 600

Write-Host "Copiando la aplicacion a: $InstallDir"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$null = robocopy $Source $InstallDir /MIR /NJH /NJS /NDL /NP /NFL
if ($LASTEXITCODE -ge 8) { throw "robocopy fallo con codigo $LASTEXITCODE" }
$global:LASTEXITCODE = 0

# ---- Accesos directos (Escritorio + Menu Inicio) con el icono Nagi ----
function New-Shortcut($linkPath) {
  $ws = New-Object -ComObject WScript.Shell
  $sc = $ws.CreateShortcut($linkPath)
  $sc.TargetPath       = $Exe
  $sc.WorkingDirectory = $InstallDir
  $sc.IconLocation     = "$Exe,0"
  $sc.Description       = "Nagi PDF Studio"
  $sc.Save()
}
$desktop   = [Environment]::GetFolderPath("Desktop")
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
New-Shortcut (Join-Path $desktop   "Nagi PDF Studio.lnk")
New-Shortcut (Join-Path $startMenu "Nagi PDF Studio.lnk")
Write-Host "Accesos directos creados."

# ---- Generar los .reg del menu contextual (apuntando al exe instalado) ----
$exeReg = $Exe.Replace('\', '\\')
$icon   = "$exeReg,0"
$verbs = @(
  @('.pdf',  'NagiOpen',    'Abrir con Nagi PDF Studio',                'open'),
  @('.pdf',  'NagiMerge',   'Combinar archivos con Nagi PDF Studio',    'merge'),
  @('.pdf',  'NagiConvert', 'Convertir a imágenes con Nagi PDF Studio', 'pdf2img'),
  @('.png',  'NagiImg2Pdf', 'Crear PDF con Nagi PDF Studio',            'img2pdf'),
  @('.jpg',  'NagiImg2Pdf', 'Crear PDF con Nagi PDF Studio',            'img2pdf'),
  @('.jpeg', 'NagiImg2Pdf', 'Crear PDF con Nagi PDF Studio',            'img2pdf'),
  @('.webp', 'NagiImg2Pdf', 'Crear PDF con Nagi PDF Studio',            'img2pdf')
)
$add = @('Windows Registry Editor Version 5.00', '')
$del = @('Windows Registry Editor Version 5.00', '')
foreach ($v in $verbs) {
  $base = "HKEY_LOCAL_MACHINE\SOFTWARE\Classes\SystemFileAssociations\$($v[0])\shell\$($v[1])"
  $add += "[$base]"
  $add += "@=`"$($v[2])`""
  $add += "`"Icon`"=`"$icon`""
  $add += "`"MultiSelectModel`"=`"Document`""
  $add += ""
  $add += "[$base\command]"
  $add += "@=`"\`"$exeReg\`" \`"--nagi=$($v[3])\`" \`"%1\`"`""
  $add += ""
  $del += "[-$base]"
  $del += ""
}
$addReg = Join-Path $BuildDir 'nagi-context-menu.reg'
$delReg = Join-Path $BuildDir 'nagi-context-menu-uninstall.reg'
$add | Out-File -FilePath $addReg -Encoding Unicode
$del | Out-File -FilePath $delReg -Encoding Unicode

# ---- Importar a HKLM (necesita admin; aparece UAC una vez) ----
Write-Host "Anadiendo el menu del clic derecho (acepta el aviso de administrador)..."
$p = Start-Process reg.exe -ArgumentList 'import', "`"$addReg`"" -Verb RunAs -PassThru -Wait
if ($p.ExitCode -ne 0) { throw "La importacion del registro fallo (codigo $($p.ExitCode))." }

# Refrescar el Explorador
$sig = '[System.Runtime.InteropServices.DllImport("shell32.dll")] public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);'
Add-Type -MemberDefinition $sig -Namespace WinAPI -Name Shell -ErrorAction SilentlyContinue
[WinAPI.Shell]::SHChangeNotify(0x8000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host ""
Write-Host "==================================================="
Write-Host " Nagi PDF Studio instalado correctamente."
Write-Host " - App:  $Exe"
Write-Host " - Clic derecho sobre PDFs / imagenes -> 'Mostrar mas opciones'."
Write-Host "==================================================="
