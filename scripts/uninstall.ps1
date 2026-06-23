# ============================================================
#  Nagi PDF Studio — desinstalador (deshace install.ps1)
# ============================================================
$ErrorActionPreference = "SilentlyContinue"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$InstallDir  = Join-Path $env:LOCALAPPDATA "Programs\Nagi PDF Studio"
$delReg      = Join-Path $ProjectRoot "build\nagi-context-menu-uninstall.reg"

Write-Host "Cerrando la app..."
Get-Process "Nagi PDF Studio" | Stop-Process -Force
Start-Sleep -Milliseconds 600

Write-Host "Quitando el menu del clic derecho (acepta el aviso de administrador)..."
if (Test-Path $delReg) {
  Start-Process reg.exe -ArgumentList 'import', "`"$delReg`"" -Verb RunAs -Wait
}

Write-Host "Quitando accesos directos..."
Remove-Item (Join-Path ([Environment]::GetFolderPath("Desktop")) "Nagi PDF Studio.lnk") -Force
Remove-Item (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Nagi PDF Studio.lnk") -Force

Write-Host "Borrando la aplicacion..."
Remove-Item $InstallDir -Recurse -Force

$sig = '[System.Runtime.InteropServices.DllImport("shell32.dll")] public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);'
Add-Type -MemberDefinition $sig -Namespace WinAPI -Name Shell -ErrorAction SilentlyContinue
[WinAPI.Shell]::SHChangeNotify(0x8000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host "Nagi PDF Studio desinstalado."
