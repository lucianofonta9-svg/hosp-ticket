# Sistema de Gestión de Tickets - Hospital Rafaela

Proyecto desarrollado para el TFI de la UTN Rafaela. 
Una aplicación para el registro y seguimiento de incidentes técnicos en el hospital.

## Tecnologías Utilizadas
* **Frontend:** Next.js 15 (App Router)
* **Estilos:** Tailwind CSS
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Lenguaje:** TypeScript

## Funcionalidades
- [x] Registro de tickets con autocompletado de internos por sector.
- [x] Clasificación por categorías (Hardware, Software, Redes, etc.).
- [x] Diferenciación entre resolución inmediata y tickets en proceso.
- [ ] Visualización de tickets pendientes con contador de tiempo real (En desarrollo).

## Configuración Local
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Configurar el archivo `.env` con la URL de PostgreSQL.
4. Ejecutar `npx prisma migrate dev`.
5. Iniciar con `npm run dev`.
