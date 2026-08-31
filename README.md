<div align="center">

# Readr

### A fast, 100% local, distraction-free mobile e-reader crafted for serious readers.

[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg?style=flat-square)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000000.svg?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86.3-000000.svg?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-000000.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Package Manager](https://img.shields.io/badge/Package_Manager-Bun_1.3-000000.svg?style=flat-square&logo=bun)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Tests-15_Passed-000000.svg?style=flat-square)](tests/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-000000.svg?style=flat-square)](#contributing)

<br />

</div>

## Overview

**Readr** is an open-source mobile reading application built with Expo SDK 57, React Native 0.86, and Drizzle ORM. Unlike commercial reading apps that trap readers in walled gardens or collect reading telemetry, Readr is **100% local**:

- **Zero Cloud Databases**: All reading history, bookmarks, highlights, and preferences live strictly on your device in SQLite.
- **Zero Mandatory Accounts**: No logins, no telemetry trackers, no remote analytics.
- **Universal Multi-Format Support**: Reads EPUB, PDF, plain text, and Markdown files.
- **2:3 Classic Book Proportions**: All book covers enforce classic 2:3 aspect ratios across grid and list views.
- **Triple-Typeface Hierarchy**: Engineered with *Mona Sans*, *Hubot Sans*, and *Mona Sans Mono* for modern typography.
- **Monochromatic Aesthetic**: Calibrated grey, white, and black palettes with an independent color-temperature warmth overlay.

## Key Features

### Library & Organization
- **Grid & List Views**: Switch between responsive 2-column cover grids and detailed reading list modes.
- **Instant Toggle Search**: Quick header search button with an auto-focusing collapsible query bar and real-time title/author filtering.
- **Multi-Criteria Filtering**: Filter by reading status (*Reading*, *Completed*, *Want to Read*) and file formats (*EPUB*, *PDF*, *MD*, *TXT*).
- **1-Tap Import**: Fast file picker supporting single and batch imports with SHA-256 deduplication.

### Immersive Reading Engine
- **Universal Format Parser**: Native support for EPUB 2/3, PDF, Markdown, and TXT files.
- **The Fluid Folio Bar**: An unobtrusive bottom margin indicator displaying chapter title, mini-progress track, and velocity-calculated reading time estimates.
- **Dynamic Theming**: 4 calibrated palettes (**Crisp White**, **Parchment Grey**, **Charcoal Dusk**, and **OLED Pure Black**) paired with a color-temperature warmth overlay.
- **Granular Typography Picker**: Custom controls for reading typefaces (*Mona Sans*, *Hubot Sans*, *Mona Sans Mono*, *Literata*, *Atkinson Hyperlegible*, *Merriweather*, *JetBrains Mono*, *System*), font size stepper, line-height, text alignment, and margins.
- **Debounced Progress Persistence**: Reading location auto-saves every 500ms and flushes atomically to SQLite whenever the app is backgrounded.

### Highlights, Notes & Dictionary
- **Monochromatic Highlighting**: High-contrast, greyscale marker shades (Charcoal, Graphite, Silver, Platinum, Smoke).
- **Text-Anchored Notes**: Attach rich notes to any highlight and export them to clean Markdown.
- **Instant Offline Dictionary**: Long-press definition overlay complete with phonetics, parts of speech, usage examples, and audio pronunciation.

### Audio Narration (Text-to-Speech)
- **Background Read-Aloud**: Sentence-by-sentence text-to-speech engine powered by `expo-speech`.
- **Playback and Speed Controls**: 0.5x to 2.0x playback speed adjustments.
- **Configurable Sleep Timer**: 15, 30, 45, or 60-minute automatic shutoff timer.

### Reading Insights & Habit Tracking
- **16-Week Consistency Heatmap**: Monochromatic activity squares tracking daily reading frequency.
- **Streak & Velocity Metrics**: Track daily reading streaks, total minutes read, and completed books.
- **Customizable Daily Goals**: Set daily reading targets (time and pages) with milestone achievements.

### Portable Local Backup & Restore
- **Single-File Data Portability**: Export your entire library, annotations, and reading history into a portable `.readr` container archive.
- **Native OS Sharing**: AirDrop, save to files, or back up to your personal cloud drive without a server.
- **Full Restore Engine**: Merge `.readr` backups with automatic checksum validation and deduplication.

### Curated Open Catalogs
- **1-Tap Classic Downloads**: Instant access to curated public-domain masterpieces (*Pride and Prejudice*, *Meditations*, *The Great Gatsby*, *Frankenstein*, *Walden*) stored directly in your local sandbox.

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.2+ recommended)
- Node.js (v18+)
- [Expo Go](https://expo.dev/go) or an iOS/Android simulator / Custom Dev Client

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/hawkdotdev/readr.git
cd readr
bun install
```

### 2. Start the Development Server
```bash
bun run start
```

### 3. Launch on Target Platform
```bash
bun run ios        # Launch on iOS Simulator
bun run android    # Launch on Android Emulator
bun run web        # Launch in Browser Preview
```

### 4. Run Typecheck and Test Suites
```bash
bun run typecheck  # Run strict TypeScript compiler verification (0 errors)
bun test           # Run 15 automated unit test suites (100% pass)
```

## Contributing

Contributions are warmly welcomed! Please read our [**Contributing Guide**](CONTRIBUTING.md) for full details on our development workflow, coding standards, typography conventions, and pull request process.

1. **Fork the repository**.
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`.
3. **Commit your changes**: `git commit -m 'Add amazing feature'`.
4. **Verify tests and types**: Ensure `bun run typecheck` and `bun test` pass with 0 errors.
5. **Push to your branch**: `git push origin feature/amazing-feature`.
6. **Open a Pull Request**.

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

<div align="center">
  Crafted with care by <b>HawkdotDev</b>.
</div>
