🌐 **Idioma / Language**: [English](CONTRIBUTING.md) | **Español (Argentina)**

---

# Cómo Contribuir a Changui ⚙️

¡Muchas gracias por tu interés en colaborar con **Changui**! Recibimos con los brazos abiertos contribuciones de desarrolladores de cualquier nivel de experiencia.

Este documento tiene las pautas e instrucciones necesarias para empezar a colaborar en el proyecto.

---

## 🛠️ Configuración del Entorno Local

### Requisitos Previos
- **Node.js**: `v20.0.0` o superior
- **Git**: Instalado y disponible en tu terminal

### Pasos de Instalación

1. **Hacé un Fork y Cloná el Repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/changui.git
   cd changui
   ```

2. **Instalá las Dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutá en Modo Desarrollo**:
   Podés correr la CLI directamente desde el código fuente usando `tsx`:
   ```bash
   npm run dev
   ```

4. **Ejecutá los Chequeos de Tipos y Tests**:
   Usamos [Vitest](https://vitest.dev/) para pruebas unitarias y TypeScript para verificación de tipos:
   ```bash
   npm run typecheck
   npm test
   ```

5. **Compilá el Ejecutable de Producción**:
   Usamos [tsup](https://tsup.build/) para empaquetar el código TypeScript en `dist/cli.js`:
   ```bash
   npm run build
   ```

---

## 📐 Arquitectura del Proyecto

Changui está construido con TypeScript y React Ink (framework para interfaces en terminal). La estructura del código es la siguiente:

```
src/
├── cli.ts            # Punto de entrada de la CLI (Commander.js)
├── core/             # Lógica de negocio y utilidades de Git
│   ├── config/       # Configuración del usuario y detección de editores
│   ├── git/          # Integración con Simple-Git y parseo de diffs
│   ├── i18n/         # Cadenas de traducción (EN y ES-AR)
│   ├── mapper/       # Mapeo del árbol arquitectónico y análisis de impacto
│   └── utils/        # Utilidades (lanzador de editores, rutas de archivos)
└── ui/               # Componentes de React Ink y custom hooks
    ├── App.tsx       # Contenedor principal de la TUI
    ├── hooks/        # Hooks de estado de UI y navegación
    └── *.tsx         # Componentes de paneles (LeftTreePanel, RightImpactPanel, etc.)
```

---

## 🧪 Pautas para las Pruebas

- Toda lógica de mapeo, utilidad de Git o característica de configuración debería tener su cobertura de tests unitarios en el directorio `tests/`.
- Antes de enviar tus cambios, ejecutá `npm run typecheck && npm test` para confirmar que los tipos y los tests pasen sin fallas.

---

## 📥 Cómo Enviar un Pull Request (PR)

1. Creá una rama descriptiva para tu trabajo:
   ```bash
   git checkout -b feat/nombre-de-tu-caracteristica
   ```
2. Mantené tus commits limpios siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):
   - `feat: agregar soporte para nuevo editor`
   - `fix: corregir desbordamiento de índice en la navegación`
   - `docs: actualizar instrucciones de instalación`
3. Hacé push a tu fork y abrí un Pull Request hacia la rama `main`.
4. Verificá que los chequeos de CI pasen en tu PR.

---

## 📜 Código de Conducta

Sé respetuoso, inclusivo y colaborativo. ¡Estamos acá para construir software de calidad juntos!
