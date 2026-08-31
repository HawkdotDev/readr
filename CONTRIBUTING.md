# Contributing to Readr

Thank you for your interest in contributing to **Readr**! We welcome contributions of all kinds: bug fixes, performance improvements, new reader format parsers, design enhancements, and documentation updates.

Please take a moment to review this guide before opening an issue or pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Design Philosophy](#design-philosophy)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Testing & Verification](#testing--verification)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [License](#license)

## Code of Conduct

We are committed to providing a welcoming, constructive, and harassment-free environment for all contributors. Please be respectful, considerate, and collaborative in all discussions and code reviews.

## Design Philosophy

When contributing features or UI adjustments, keep Readr's core values in mind:

1. **100% Local & Sovereign**: No remote telemetry, no third-party tracking scripts, and no required accounts or cloud lock-in. Everything is stored locally on the device via SQLite and sandbox storage.
2. **Distraction-Free Immersion**: The reading experience must remain clean, fast, and tactile. Avoid noisy badges, interstitial popups, or unnecessary visual clutter.
3. **Typography-First**: Respect the 3-font hierarchy:
   - **Mona Sans** for primary UI body and text.
   - **Hubot Sans** for display titles and hero cards.
   - **Mona Sans Mono** for technical numbers, overlines, and metadata.
4. **Monochromatic Restraint**: Preserve the high-contrast greyscale / OLED color system with smooth, subtle warmth controls.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (v1.2+ recommended)
- Node.js (v18+ LTS)
- Git
- [Expo Go](https://expo.dev/go) on your physical mobile device, or Xcode / Android Studio simulator

### Installation

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/readr.git
   cd readr
   ```

2. **Install dependencies using Bun:**
   ```bash
   bun install
   ```

3. **Start the Metro development server:**
   ```bash
   bun run start
   ```

4. **Run on your target platform:**
   - **iOS Simulator:** `bun run ios`
   - **Android Emulator:** `bun run android`
   - **Web Preview:** `bun run web`

## Project Architecture

```
readr/
├── app/                      # Expo Router file-based route definitions
│   ├── (tabs)/               # Bottom tab navigator (library, explore, stats, settings)
│   ├── reader/               # Fullscreen reading stack & modal sheets
│   ├── book/                 # Book metadata & session history view
│   ├── collection/           # Custom shelf collections
│   ├── backup/               # .readr data export & restore wizard
│   └── _layout.tsx           # Root layout (Fonts, database bootstrapper)
├── assets/
│   └── fonts/                # Static TTF assets (Mona Sans, Hubot Sans, Mona Sans Mono)
├── src/
│   ├── components/           # Reusable React Native UI components
│   │   ├── common/           # ThemeProvider, Button, Sheet, Slider, Badge, SearchBar
│   │   ├── reader/           # FolioBar, ReaderToolbar, EpubReader, sheets
│   │   ├── library/          # BookCard, EmptyLibrary, FilterBar
│   │   └── stats/            # StreakHeatmap, StatCard, GoalProgressRing
│   ├── db/                   # Local SQLite database (expo-sqlite + Drizzle ORM)
│   ├── services/             # Core business logic (storage, TTS, dictionary, backup, OPDS)
│   ├── store/                # Transient Zustand state stores
│   ├── utils/                # Typography tokens, theme colors & time formatters
│   └── types/                # Shared TypeScript models
└── tests/                    # Automated test suites with Bun test runner
```

## Development Workflow

1. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**: Write clean, modular, and well-typed code.

3. **Test your code**: Ensure all unit tests pass and new functionality includes test coverage.

4. **Verify types**: Ensure strict TypeScript checking produces zero errors.

## Coding Guidelines

- **TypeScript**: Strict mode is enabled. Do not use `any` unless absolutely necessary for low-level platform APIs. Always provide explicit interfaces and types in `src/types/`.
- **Styling**: Use StyleSheet objects or NativeWind utilities adhering to the curated monochromatic design tokens (`colors.canvas`, `colors.surface`, `colors.border`, `colors.accent`, `colors.textPrimary`, `colors.textSecondary`).
- **Typography Tokens**: Always import and reference `FONTS` from `src/utils/typography.ts` instead of hardcoded system font names.
- **Error Handling**: Gracefully catch and handle filesystem or SQLite errors with informative user alerts or non-crashing fallbacks.
- **Documentation**: Preserve existing docstrings and comments. If introducing a complex algorithm (e.g. parser or encryption), add concise explanatory comments.

## Testing & Verification

Readr maintains strict quality verification standards. Run the following checks locally before opening a pull request:

### 1. Run Strict TypeScript Typecheck
```bash
bun run typecheck
```
*Must complete with 0 errors.*

### 2. Run Automated Unit Tests
```bash
bun test
```
*All test suites must pass (15/15 passing).*

### 3. Adding New Tests
When adding new services or utility logic, create corresponding test files in `tests/` matching the directory structure (e.g., `tests/services/myService.test.ts`).

## Submitting a Pull Request

1. **Commit your changes**: Write clear, descriptive commit messages following the Conventional Commits format:
   ```bash
   git commit -m "feat(reader): add custom line-height stepper control"
   git commit -m "fix(backup): resolve checksum mismatch during restore"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

3. **Open a Pull Request**:
   - Provide a clear summary of what changes were made and why.
   - Attach screenshots or screen recordings for UI/visual modifications.
   - Reference any relevant open issues (e.g. `Closes #12`).

## License

By contributing to Readr, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
