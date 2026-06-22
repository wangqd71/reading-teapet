!macro customInit
  nsExec::Exec 'cmd /c taskkill /F /IM reading-teapet.exe /T >nul 2>&1 & taskkill /F /FI "WINDOWTITLE eq *read*" /T >nul 2>&1'
!macroend
