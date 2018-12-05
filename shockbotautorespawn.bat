@echo off
:start
node app.js
echo Program terminated at %Date% %Time% with Error %ErrorLevel%
echo Press Ctrl-C if you don't want to restart automatically
ping -n 30 localhost
goto start