Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node server.js --hidden", 0, false
