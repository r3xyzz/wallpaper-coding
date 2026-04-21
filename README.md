# wallpaper-coding
Wallpaper web con código, reloj analógico y clima configurable por ciudad.

## Configurar la ciudad en Wallpaper Engine

1. Abre el proyecto en Wallpaper Engine como web wallpaper.
2. En Project Settings, agrega una propiedad nueva de tipo Text.
3. Ponle como key `city`.
4. Escribe la ciudad que quieras ver en el clima.

## Exportar

1. Deja dentro de la carpeta estos archivos: `index.html`, `css.css`, `js.js`.
2. En Wallpaper Engine, usa la opción para crear o importar un web wallpaper y apunta a esta carpeta.
3. Guarda el proyecto y luego publícalo desde Wallpaper Engine.

## Probar

1. Para probar en navegador local, abre `index.html` con Live Server o un servidor local.
2. Para forzar una ciudad sin Wallpaper Engine, puedes usar la URL `index.html?city=Madrid`.
3. Si cambias la propiedad `city` en Wallpaper Engine, el clima se actualiza solo.
