# BG3 Load Architect

AI-powered load order organizer for **Baldur's Gate 3** using a hybrid deterministic pipeline and local AI models through LM Studio.

![Electron](https://img.shields.io/badge/Electron-Desktop-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![MIT License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

BG3 Load Architect analyzes your `modsettings.lsx` file and generates an optimized load order by combining:

- Deterministic dependency resolution
- Local AI reasoning through LM Studio
- Community metadata database
- Automatic validation and repair pipeline

The application works entirely offline when using LM Studio.

---

## Features

- ✅ Parse `modsettings.lsx`
- ✅ Automatic dependency graph generation
- ✅ Deterministic dependency sorting
- ✅ AI-assisted load order optimization
- ✅ Post-validation and automatic repair
- ✅ Translation pairing
- ✅ Compatibility Framework handling
- ✅ Obsolete mod detection
- ✅ Community metadata database
- ✅ Confidence score
- ✅ LM Studio integration
- ✅ Electron desktop application
- ✅ English / Italian interface

---

## Technologies

- Electron
- React
- TypeScript
- Express
- Vite
- LM Studio (OpenAI-compatible API)

---

## Installation

Clone the repository

```bash
git clone https://github.com/Pitero14/bg3-load-architect.git
```

Install dependencies

```bash
npm install
```

Run in development

```bash
npm run electron:start
```

---

## Build

Generate the standalone Windows executable

```bash
npm run electron:pack
```

The executable will be generated inside:

```text
dist-electron/
```

---

## Architecture

The project documentation is available in:

- ARCHITECTURE.md
- SERVER_ANALYSIS.md

---

## License

Released under the MIT License.
