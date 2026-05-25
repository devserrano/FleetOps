# BiciOps 

Sistema de gestión operativa para flotillas de bicitaxis desarrollado con arquitectura Full Stack utilizando Node.js, Express, PostgreSQL y una interfaz administrativa moderna tipo SaaS Dashboard.

---

## Descripción

BiciOps permite administrar unidades de bicitaxi, operadores, inspecciones técnicas y mantenimientos desde un panel centralizado.

El sistema fue diseñado para simular un entorno real de control operativo de flotillas urbanas, incorporando dashboards dinámicos, métricas visuales y gestión modular de información.

---

# Características principales

## Gestión de vehículos
- Registro de unidades
- Edición de estados
- Eliminación de vehículos
- Estados operativos dinámicos
- Paginación de registros
- Filtros por estado

## Mantenimiento
- Registro de servicios
- Seguimiento de mantenimientos
- Control de costos
- Observaciones técnicas
- Estados visuales

## Inspecciones
- Registro de inspecciones técnicas
- Resultados visuales
- Seguimiento operativo
- Indicadores de aprobación
- Alertas de mantenimiento

## Operadores
- Visualización de operadores
- Información de contacto
- Asignación de unidades
- Diseño tipo tarjetas

## Dashboard operativo
- Estadísticas dinámicas
- Salud de flota
- Alertas críticas
- Últimas inspecciones
- Mantenimientos recientes

---

# Tecnologías utilizadas

## Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Font Awesome

## Backend
- Node.js
- Express.js

## Base de datos
- PostgreSQL

## Contenedores
- Docker
- Docker Compose

## Autor

Diego Serrano  
Ingeniería en Computación - UNAM

# Arquitectura del proyecto

```txt
biciops/
│
├── backend/
│   ├── src/
│   │   └── config/
│   │       └── db.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── css/
│   │   ├── dashboard.css
│   │   ├── vehiculos.css
│   │   ├── inspecciones.css
│   │   ├── mantenimiento.css
│   │   ├── operadores.css
│   │   ├── sidebar.css
│   │   ├── topbar.css
│   │   ├── modal.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── dashboard.js
│   │   ├── vehiculos.js
│   │   ├── inspecciones.js
│   │   ├── mantenimiento.js
│   │   ├── operadores.js
│   │   └── modales.js
│   │
│   └── index.html
│
├── docker-compose.yml
├── .gitignore
└── README.md
```
