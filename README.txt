# ARG420 — sitio inicial

## Qué incluye
- Diseño responsive negro/verde urbano.
- Sorteo visual de 40 números.
- Selección de hasta 2 números y cálculo de precio ($5.000 / $9.000).
- Mensaje preparado hacia WhatsApp +54 9 11 2522-9926.
- Secciones de genéticas, novedades y combos con las imágenes aportadas.

## Importante: estado de esta versión
Esta es una **maqueta funcional de interfaz**, no un sistema de reservas en producción.
La selección de números ocurre solo en el navegador y NO se sincroniza entre visitantes.
No publiques el enlace como sistema de reservas real hasta conectar una base de datos y autenticación.

## Para completar reservas reales
Configurar Supabase (o un backend equivalente):
1. Crear proyecto y tabla `reservations` con número único, nombre, teléfono, estado y fechas.
2. Implementar una operación transaccional/RPC que reserve uno o dos números solo si ambos siguen disponibles.
3. Permitir que el público cree solicitudes pendientes, pero solo el administrador autenticado pueda confirmar/liberar.
4. Activar políticas RLS; nunca colocar una `service_role` key en el frontend.
5. Crear acceso privado de administrador con autenticación real.
6. Probar concurrencia desde dos celulares antes de compartir.

## Publicar en GitHub Pages
1. Crear un repositorio nuevo llamado `arg420-sorteo`.
2. Subir todos los archivos y la carpeta `assets`.
3. En Settings → Pages, seleccionar Deploy from a branch, `main`, `/ (root)`.
4. Esperar a que GitHub entregue la URL pública.

Para soporte: el archivo `index.html` es la página principal.
