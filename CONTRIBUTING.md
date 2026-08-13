# Contributing to Changui ⚙️

Thank you for your interest in contributing to **Changui**! We welcome contributions from developers of all experience levels.

This document provides a set of guidelines and instructions for contributing to the project.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Git**: Installed and configured on your machine

### Setup Instructions

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/changui.git
   cd changui
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run in Development Mode**:
   Execute the CLI directly from source using `tsx`:
   ```bash
   npm run dev
   ```

4. **Run the Test Suite**:
   We use [Vitest](https://vitest.dev/) for unit testing.
   ```bash
   npm test
   ```

5. **Build the Production Executable**:
   We use [tsup](https://tsup.build/) to bundle the TypeScript CLI tool into `dist/cli.js`.
   ```bash
   npm run build
   ```

---

## 📐 Project Architecture

Changui is built with TypeScript and React Ink (Terminal User Interface framework). The codebase is structured as follows:

```
src/
├── cli.ts            # Entrypoint CLI command parser (Commander.js)
├── core/             # Business logic & Git domain utilities
│   ├── config/       # User config & editor detection
│   ├── git/          # Simple-Git integration & diff parsing
│   ├── i18n/         # Internationalization strings (EN & ES-AR)
│   ├── mapper/       # Architectural tree mapping & impact analysis
│   └── utils/        # Helper utilities (editor launcher, file path resolution)
└── ui/               # Ink React TUI components & custom hooks
    ├── App.tsx       # Root TUI container
    ├── hooks/        # UI state & navigation hooks
    └── *.tsx         # Panel components (LeftTreePanel, RightImpactPanel, etc.)
```

---

## 🧪 Testing Guidelines

- Every core mapping logic, Git utility, or configuration feature should be covered by unit tests in the `tests/` directory.
- Run `npm test` before pushing your changes to verify all tests pass.

---

## 📥 Submitting a Pull Request (PR)

1. Create a descriptive topic branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Keep your commits clean and follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add support for new editor`
   - `fix: resolve tree navigation index overflow`
   - `docs: update setup instructions`
3. Push to your fork and submit a Pull Request targeting the `main` branch.
4. Ensure CI checks pass on your PR.

---

## 📜 Code of Conduct

Be respectful, inclusive, and collaborative. We are here to build great software together!
