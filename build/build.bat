call "D:\programs\nodejs\nodevars.bat"
node r.js -o buildMizar.js
node r.js -o cssIn=../src/mizar_gui/css/style.css out=../src/mizar_gui/css/style.min.css
pause
