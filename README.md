# Tavolo Web

## Descripción del Proyecto

Tavolo Web es una aplicación web desarrollada con Vue 3 que permite gestionar reservas y visualizar sedes en un mapa interactivo.

## Tecnologías y Lenguajes

- **Frontend Framework**: Vue 3
- **Build Tool**: Vite
- **Lenguajes**: JavaScript, HTML, CSS
- **Componentes UI**: PrimeIcons para iconografía
- **Mapas**: Mapbox GL
- **Enrutamiento**: Vue Router

## Dependencias Principales

- Vue 3 (Composition API)
- Mapbox GL (visualización de mapas)
- Vue Router (navegación entre páginas)
- PrimeIcons (iconografía)

## Estructura del Proyecto

El proyecto sigue una estructura organizada por módulos:
- `/src/booking/components`: Componentes reutilizables relacionados con reservas
- `/src/booking/pages`: Páginas principales del módulo de reservas
- `/src/booking/services`: Servicios para manejo de datos y lógica de negocio

## Características Principales

- Visualización de sedes en mapas interactivos
- Información detallada de cada sede
- Interfaz responsiva adaptada a dispositivos móviles

## Configuración del Entorno de Desarrollo

### IDE Recomendado

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desactivar Vetur).

### Instalación de Dependencias

```sh
npm install
```

### Compilación y Hot-Reload para Desarrollo

```sh
npm run dev
```

### Compilación y Minificación para Producción

```sh
npm run build
```