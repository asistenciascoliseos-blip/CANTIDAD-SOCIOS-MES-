# Registro de atención

Página estática para registrar, en cualquier año, por fecha, turno (mañana o tarde) y gimnasio. Las sedes disponibles son:

- Ferrero
- Chacarilla
- Montjoy
- San Ignacio

En cada registro se indican las cantidades de:

- Socios
- Socios nuevos
- Libre
- Cartilla nueva
- Cartilla renovada

## Cómo usarla

1. Abre `index.html` en un navegador.
2. Completa el formulario y pulsa **Guardar registro**.
3. Los datos quedan guardados solo en el navegador (`localStorage`) de ese dispositivo.
4. Descarga periódicamente el archivo **JSON** como copia de respaldo. También puedes usar Excel exportando el CSV o abrir el JSON en otra herramienta.

Para compartirla en GitHub: sube `index.html`, `styles.css`, `app.js` y `README.md` a un repositorio, y activa GitHub Pages desde **Settings → Pages → Deploy from a branch** si quieres publicarla como página estática.

> Importante: esta versión es local. No hay sincronización ni conexión a Google Sheets ni a ningún servicio en la nube. Cada dispositivo guarda su propio listado local; para consolidar datos entre varios equipos, tendrás que exportar/importar los archivos JSON manualmente.
