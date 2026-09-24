# Registro de atención

Página estática para registrar, en cualquier año, por fecha y turno (mañana o tarde), las cantidades de:

- Socios
- Socios nuevos
- Libre
- Cartilla nueva
- Cartilla renovada

## Cómo usarla

1. Abre `index.html` en un navegador, o publícala con **GitHub Pages**.
2. Completa el formulario y pulsa **Guardar registro**.
3. Los datos quedan guardados en el `localStorage` del navegador y no se envían a ningún servidor.
4. Descarga periódicamente el archivo **JSON** como copia de respaldo. También puedes usar CSV para abrirlo en Excel o Google Sheets.

Para compartirla en GitHub: sube `index.html`, `styles.css`, `app.js` y `README.md` a un repositorio, y activa GitHub Pages desde **Settings → Pages → Deploy from a branch**.

> Importante: GitHub Pages solo publica la página; no es una base de datos. Si varias personas usan distintos celulares, cada dispositivo tendrá sus propios registros. Para centralizar datos de varios usuarios se necesitaría conectar un servicio con base de datos y autenticación.

## Sincronizar laptop y tablet con Google Sheets

El archivo `google-apps-script.gs` deja preparada una conexión gratuita con una hoja de Google:

1. Crea una hoja nueva en [Google Sheets](https://sheets.google.com).
2. Abre **Extensiones → Apps Script**.
3. Borra el código que aparece y pega todo el contenido de `google-apps-script.gs`.
4. Guarda el proyecto y ejecuta la función `setup`. Autoriza los permisos que solicite Google.
5. Pulsa **Implementar → Nueva implementación**.
6. Elige **Aplicación web**. En acceso, selecciona **Cualquier persona** y pulsa **Implementar**.
7. Copia la URL que termina en `/exec`.

La página todavía necesita esa URL para activar la sincronización. No compartas la hoja como pública: solo se comparte la dirección de la aplicación web.
