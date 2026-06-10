@echo off
cd /d "%~dp0\..\.."
powershell -NoExit -ExecutionPolicy Bypass -File .\.codex\mcp\login-feishu-user-oauth.ps1
