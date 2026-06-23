; ============================================================
;  Nagi PDF Studio — menú contextual del Explorador (clic derecho)
;  Se ejecuta al instalar / desinstalar. Usa HKCU (sin admin).
; ============================================================

!macro customInstall
  ; Icono = el propio icono de la app (Nagi)
  !define NAGI_EXE "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  !define NAGI_ICON "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"

  ; ---------- PDF: Abrir ----------
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiOpen" "" "Abrir con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiOpen" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiOpen" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiOpen\command" "" '"${NAGI_EXE}" "--nagi=open" "%1"'

  ; ---------- PDF: Combinar ----------
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiMerge" "" "Combinar archivos con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiMerge" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiMerge" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiMerge\command" "" '"${NAGI_EXE}" "--nagi=merge" "%1"'

  ; ---------- PDF: Convertir a imágenes ----------
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiConvert" "" "Convertir a imágenes con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiConvert" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiConvert" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiConvert\command" "" '"${NAGI_EXE}" "--nagi=pdf2img" "%1"'

  ; ---------- Imágenes: Crear PDF ----------
  ; (.png .jpg .jpeg .webp)
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.png\shell\NagiImg2Pdf" "" "Crear PDF con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.png\shell\NagiImg2Pdf" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.png\shell\NagiImg2Pdf" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.png\shell\NagiImg2Pdf\command" "" '"${NAGI_EXE}" "--nagi=img2pdf" "%1"'

  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpg\shell\NagiImg2Pdf" "" "Crear PDF con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpg\shell\NagiImg2Pdf" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpg\shell\NagiImg2Pdf" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpg\shell\NagiImg2Pdf\command" "" '"${NAGI_EXE}" "--nagi=img2pdf" "%1"'

  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpeg\shell\NagiImg2Pdf" "" "Crear PDF con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpeg\shell\NagiImg2Pdf" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpeg\shell\NagiImg2Pdf" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.jpeg\shell\NagiImg2Pdf\command" "" '"${NAGI_EXE}" "--nagi=img2pdf" "%1"'

  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webp\shell\NagiImg2Pdf" "" "Crear PDF con Nagi PDF Studio"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webp\shell\NagiImg2Pdf" "Icon" "${NAGI_ICON}"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webp\shell\NagiImg2Pdf" "MultiSelectModel" "Document"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webp\shell\NagiImg2Pdf\command" "" '"${NAGI_EXE}" "--nagi=img2pdf" "%1"'

  ; Refrescar el shell para que aparezcan ya
  System::Call 'shell32.dll::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiOpen"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiMerge"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.pdf\shell\NagiConvert"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.png\shell\NagiImg2Pdf"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.jpg\shell\NagiImg2Pdf"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.jpeg\shell\NagiImg2Pdf"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.webp\shell\NagiImg2Pdf"
  System::Call 'shell32.dll::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
