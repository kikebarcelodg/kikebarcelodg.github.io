# Portfolio Kike Barceló

Web estática (HTML, CSS y JavaScript). Sin dependencias: solo Google Fonts.

## Publicar en GitHub Pages
1. Sube TODO el contenido de esta carpeta a la raíz del repositorio (incluido `.nojekyll`).
2. Settings > Pages > Deploy from a branch > `main` / `(root)`.
3. Tu web quedará en `https://usuario.github.io/repositorio/`.

## Imágenes
Guarda las imágenes de cada proyecto en `img/proyectos/<nombre-del-proyecto>/` con estos nombres:
`cover.jpg` (portada) y `1.jpg`, `2.jpg`, `3.jpg` (galería). Hasta que existan, se muestra el color de la marca.

## Qué editar
- Textos, orden y colores de proyectos: `js/projects.js`
- Menú y footer: `js/layout.js`
- Colores y tipografías globales: `css/base.css`

## Portada interactiva
`js/gravity.js` hace caer las letras de "Kike Barceló" al hacer click. Usa Matter.js desde cdnjs (en `index.html`). Para no depender del CDN, descarga `matter.min.js` a `js/` y cambia la ruta del script.

## Comprobar imágenes antes de publicar
`node tools/check-images.js` compara las imágenes que usa la web con las que existen (respetando mayúsculas) y lista las que faltan.
Cada proyecto necesita `cover.jpg` y las de su galería (`1.jpg`, `2.jpg`... según `js/projects.js`), en minúsculas y con extensión `.jpg`.
Las carpetas vacías llevan un `.gitkeep` porque Git no sube carpetas vacías.
