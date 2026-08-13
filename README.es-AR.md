🌐 **Idioma / Language**: [English](README.md) | **Español (Argentina)**

---

# Changui ⚙️ VISUALIZADOR DE CAMBIOS

**Changui** es una herramienta de interfaz de línea de comandos (CLI TUI) que facilita la visualización de cambios en tu proyecto, ideal para desarrolladores que trabajan en Monorepos y proyectos con arquitectura en capas.

A diferencia de `git status` o herramientas tradicionales que listan archivos modificados de forma plana, **Changui** mapea y visualiza los cambios de Git organizados según la estructura arquitectónica del proyecto (Apps, Paquetes compartidos, Capas, Directorios y archivos de configuración agrupados).

<img width="1423" height="730" alt="image" src="https://github.com/user-attachments/assets/a1c443c5-f97e-4c0c-9dea-83b25dbfbbf2" />

---

## 🚀 Características Principales

- **Árbol de Arquitectura Inteligente**: Clasifica automáticamente monorepos (`pnpm-workspace.yaml`, `workspaces`, `tsconfig` references) y agrupa archivos de ruido (`package-lock.json`, `tsconfig.json`, `.gitignore`) bajo un nodo virtual `[configs]`.
- **Detección Automática de Tech Stack**: Identifica frameworks y herramientas en uso (**Next.js**, **Astro**, **React**, **Vue**, **NestJS**, **TypeScript**, **TailwindCSS**, etc.) con sus versiones exactas.
- **Visor de Diff de Git Integrado**: Permite ver líneas agregadas (+), eliminadas (-) y bloques de diff con scroll vertical completo.
- **Buscador Directo In-Situ (`f`)**: Filtra el árbol de archivos en tiempo real sin ocultar los paneles de la interfaz.
- **Integración con Editores de Código (`[ENTER]`)**: Abre el archivo seleccionado directamente en tu editor preferido (**VS Code**, **Cursor**, **Neovim**, **Sublime Text**, **WebStorm**).
- **Configuración Persistente y Multidioma (`s`)**: Permite cambiar y guardar tu editor preferido e idioma de la interfaz (**English** o **Español Argentino**).

---

## 📦 Instalación

### Requisitos Previos
- **Node.js**: `v20.0.0` o superior.
- **Git**: Instalado y disponible en el `PATH`.

### Instalación Global (desde el código fuente)
```bash
git clone https://github.com/juato/changui.git
cd changui
npm install
npm run build
npm link
```

Una vez enlazado globalmente, podés ejecutar `changui` en cualquier directorio que sea un repositorio de Git.

---

## 🎮 Guía de Uso y Controles

Para lanzar el HUD interactivo en cualquier repositorio:
```bash
changui
```

### Accesos Rápidos de Teclado (Hotkeys)

| Tecla | Acción |
|---|---|
| `[Arriba]` / `[Abajo]` | Navegar entre nodos y archivos del árbol. |
| `[ESPACIO]` | Expandir o colapsar carpetas/nodos de arquitectura. |
| `[ENTER]` | Abrir el archivo seleccionado en el editor de código configurado. |
| `[TAB]` | Alternar foco entre el Panel de Arquitectura (izq) y el Visor de Diff (der). |
| `f` | Activar la barra de búsqueda en tiempo real. |
| `s` | Abrir el menú de configuración (Editor e Idioma). |
| `[ESC]` | Cancelar la búsqueda activa o cerrar el menú de configuración. |
| `q` | Salir de la aplicación. |

---

## ⚙️ Modos y Opciones CLI

```bash
# Ejecutar HUD interactivo en el directorio actual
changui

# Obtener la estructura arquitectónica y cambios de Git en formato JSON
changui --json

# Ver la versión de Changui
changui --version
```

---

## 🧪 Pruebas y Desarrollo

```bash
# Verificar los tipos de TypeScript sin emitir código
npm run typecheck

# Ejecutar la suite de tests unitarios con Vitest
npm test

# Compilar el ejecutable de producción con tsup
npm run build
```

---

## 🤝 Cómo Contribuir

¡Las contribuciones son súper bienvenidas! Leé nuestra guía de [CONTRIBUTING.es-AR.md](CONTRIBUTING.es-AR.md) para enterarte de cómo configurar el entorno y enviar tus Pull Requests.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Podés ver el texto oficial en [LICENSE](LICENSE) y la traducción al español en [LICENSE.es-AR.md](LICENSE.es-AR.md).
