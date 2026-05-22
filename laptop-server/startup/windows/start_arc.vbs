' Silent launcher — runs Arc Companion server with no visible console window.
' Place this file (or a shortcut to it) in:
'   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
'
' Or run install_startup.bat to do it automatically.

Option Explicit

Dim oShell, sVbsDir, sRoot

Set oShell = CreateObject("WScript.Shell")

' Resolve path: this file lives at laptop-server/startup/windows/
' so root is two levels up.
sVbsDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
sRoot = sVbsDir & "..\.."

oShell.Run "cmd /c python """ & sRoot & "\main.py"" >> """ & sRoot & "\arc.log"" 2>&1", 0, False
