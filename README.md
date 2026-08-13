🌐 **Language / Idioma**: **English** | [Español (Argentina)](README.es-AR.md)

---

# Changui ⚙️ GIT CHANGE VISUALIZER

**Changui** is a Terminal User Interface (CLI TUI) tool that visualizes Git changes organized by project architecture. It is ideal for developers working in Monorepos and layered architectural codebases.

Unlike `git status` or traditional tools that present modified files in a flat list, **Changui** maps and groups Git changes according to your project's architectural structure (Apps, Shared Packages, Layers, Directories, and grouped configuration files).

<img width="1423" height="730" alt="image" src="https://github.com/user-attachments/assets/a1c443c5-f97e-4c0c-9dea-83b25dbfbbf2" />

---

## 🚀 Key Features

- **Smart Architecture Tree**: Automatically detects monorepos (`pnpm-workspace.yaml`, `workspaces`, `tsconfig` references) and groups noise files (`package-lock.json`, `tsconfig.json`, `.gitignore`) under a virtual `[configs]` node.
- **Automatic Tech Stack Detection**: Identifies frameworks and tools (**Next.js**, **Astro**, **React**, **Vue**, **NestJS**, **TypeScript**, **TailwindCSS**, etc.) along with their exact versions.
- **Integrated Git Diff Viewer**: Inspect added (+), deleted (-), and modified diff lines with full vertical scrolling.
- **In-Situ Live Search (`f`)**: Filter the file tree in real-time without closing UI panels.
- **Code Editor Integration (`[ENTER]`)**: Open the selected file directly in your preferred editor (**VS Code**, **Cursor**, **Neovim**, **Sublime Text**, **WebStorm**).
- **Persistent Settings & Multi-Language (`s`)**: Save your preferred code editor and interface language (**English** or **Argentine Spanish**).

---

## 📦 Installation

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Git**: Installed and available in your `PATH`

### Global Installation (from source)
```bash
git clone https://github.com/juato/changui.git
cd changui
npm install
npm run build
npm link
```

Once linked globally, you can run `changui` inside any Git repository directory.

---

## 🎮 Controls & Usage Guide

To launch the interactive HUD inside any repository:
```bash
changui
```

### Hotkeys & Shortcuts

| Key | Action |
|---|---|
| `[Up]` / `[Down]` | Navigate through tree nodes and files |
| `[SPACE]` | Expand or collapse folder/architecture nodes |
| `[ENTER]` | Open selected file in your configured editor |
| `[TAB]` | Toggle focus between Architecture Tree (left) and Diff Viewer (right) |
| `f` | Open real-time search bar |
| `s` | Open settings menu (Editor & Language) |
| `[ESC]` | Cancel active search or close settings menu |
| `q` | Quit application |

---

## ⚙️ CLI Modes & Options

```bash
# Launch interactive HUD in current directory
changui

# Export architectural structure and Git changes in JSON format
changui --json

# Display Changui version
changui --version
```

---

## 🧪 Testing & Development

```bash
# Run TypeScript type check
npm run typecheck

# Run unit test suite with Vitest
npm test

# Build production executable with tsup
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) guide (or [CONTRIBUTING.es-AR.md](CONTRIBUTING.es-AR.md)) to learn how to set up the repository and submit Pull Requests.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for the official text and [LICENSE.es-AR.md](LICENSE.es-AR.md) for the Argentine Spanish translation.
