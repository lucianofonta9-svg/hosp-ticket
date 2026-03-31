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
-  Registro de tickets con autocompletado de internos por sector.
-  Clasificación por categorías.
-  Diferenciación entre resolución inmediata y tickets en proceso.
-  Visualización de tickets pendientes con contador de tiempo real.
-  Visualización de historial de tickets resueltos. 

## Configuración Local
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Configurar el archivo `.env` con la URL de PostgreSQL.
4. Ejecutar `npx prisma migrate dev`.
5. Iniciar con `npm run dev`.



