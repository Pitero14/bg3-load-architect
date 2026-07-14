# BG3 Load Order Organizer
## Architecture & Development Guidelines

Version: 0.1
Last Updated: 2026-07-13

---

# Project Philosophy

This project is designed to be:

- Easy to understand.
- Easy to maintain.
- Easy to extend.
- Safe to modify.

Readability is always preferred over clever code.

Behavior must never change unless explicitly intended.

---

# Primary Goal

Create the best load order organizer for Baldur's Gate 3.

The application should:

- Parse modsettings.lsx
- Analyze mods
- Validate load orders
- Detect conflicts
- Suggest improvements
- Work offline whenever possible
- Support optional AI providers

---

# Development Principles

## 1. Small Changes

Every change should solve one problem only.

Avoid changing unrelated code.

---

## 2. Preserve Behaviour

Refactoring must never change functionality.

If behavior changes, it must be intentional.

---

## 3. Single Responsibility

Each module should have one responsibility.

Examples:

parser.ts
    Reads XML

organizer.ts
    Orders mods

gemini.ts
    AI integration

proxy.ts
    LM Studio communication

xml.ts
    XML generation

---

## 4. Simplicity

Prefer simple code.

Avoid unnecessary abstractions.

Avoid "smart" code.

---

## 5. No Duplicate Logic

If the same logic appears twice, extract it.

---

# AI Usage Policy

AI is an assistant.

AI is NOT the architect.

AI must never:

- redesign the project
- rename files unnecessarily
- update dependencies
- change behavior
- add features without request

AI should:

- refactor
- generate repetitive code
- explain code
- write tests
- improve documentation

---

# Folder Responsibilities

server/

Contains only HTTP endpoints.

No business logic.

---

core/

Contains application logic.

Must never depend on Express.

---

components/

React UI only.

No XML parsing.

No business logic.

---

types/

Shared TypeScript types.

---

assets/

Static assets only.

---

# Coding Rules

- TypeScript strict.
- Prefer explicit types.
- Avoid "any".
- Keep functions short.
- Write descriptive names.
- No magic numbers.

---

# Dependencies

Do not update dependencies without discussion.

Stability is preferred over newest version.

---

# Build

Development:

npm run dev

Production:

npm run build

Executable packaging is NOT part of the core architecture.

---

# Long Term Goals

Phase 1

Stable application.

Phase 2

Refactored architecture.

Phase 3

Desktop application (Tauri).

Phase 4

Plugin system.

Phase 5

Community database.

---

# Definition of Done

A task is complete only if:

- Code builds.
- No TypeScript errors.
- No behavior regressions.
- No duplicated logic introduced.
- Documentation updated when needed.

---

# Project Motto

"Make the next change easier than the previous one."

---

# BossGPT Rules

Before writing code, answer these questions:

1. Is this really necessary?

2. Can it be simpler?

3. Can it be moved to a better place?

4. Does it introduce technical debt?

5. Will we understand this in six months?

If any answer is "no", rethink the solution.
