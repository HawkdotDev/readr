<div align="center">

# Readr

### A fast, 100% local, distraction-free mobile e-reader crafted for serious readers.

[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg?style=flat-square)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000000.svg?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86.3-000000.svg?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-000000.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Package Manager](https://img.shields.io/badge/Package_Manager-Bun_1.3-000000.svg?style=flat-square&logo=bun)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Tests-111_Passed-000000.svg?style=flat-square)](tests/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-000000.svg?style=flat-square)](#contributing)

<br />

</div>

## Overview

**Readr** is an open-source, privacy-first mobile reading application built with Expo SDK 57, React Native 0.86, and Drizzle ORM. Unlike commercial reading apps that lock readers into cloud walled gardens or harvest personal reading telemetry, Readr operates **100% offline**:

- **Zero Cloud Databases**: All reading sessions, bookmarks, highlights, character replacements, and preferences live strictly on your device in SQLite with WAL mode enabled.
- **Zero Mandatory Accounts**: No logins, no remote trackers, and no telemetry analytics.
- **Universal Multi-Format Engine**: Native rendering support for EPUB 2/3, PDF, TXT, Markdown, CBZ, CBR, MOBI, AZW3, FB2, DOCX, RTF, and HTML.

## Key Features

### Immersive Reading Engine & Typography
- **Universal Format Drivers**: Modular SOLID driver architecture supporting major digital book and comic formats.
- **12 Curated Reading Palettes**: Light, Sepia, Dark, OLED Pure Black, Forest Emerald, Slate, Solarized Dark, Solarized Light, Rosé Pine, Nord, Parchment, and Amber Glow.
- **Blue-Light Warmth Spectrum**: Independent color-temperature warmth overlay slider for night reading comfort.
- **Granular Typography Picker**: Custom controls for reading typefaces (*Mona Sans*, *Hubot Sans*, *Mona Sans Mono*, *Literata*, *Atkinson Hyperlegible*, *Merriweather*, *JetBrains Mono*, *System*), paragraph indentation, line-height, margin width, text alignment, and custom drop caps.
- **Per-Book Settings Persistence**: SQLite automatically preserves independent font size, theme, margins, bionic reading, orientation, and auto-scroll settings per book.

### Advanced Reading Aids & Mechanics
- **Bionic Reading Transformation Engine**: Highlights initial fixation points of words with adjustable intensity (Low, Medium, High) while preserving punctuation and HTML formatting.
- **9-Zone Touch Grid Customizer**: Fully interactive 3x3 touch grid allowing readers to remap screen zones to custom actions (Page Forward/Back, Table of Contents, Bookmark, Focus Mode, Audio Narration).
- **Auto-Scroll Suite & HUD Telemetry**: 5 auto-scroll modes (Smooth Continuous, Line-by-Line, Page Countdown Timer, Pixel-Step, Wave) with a floating speedometer overlay.
- **Reading Ruler Guide**: Draggable eye-tracking focus guide with 3 display modes (*Underline*, *Line Highlight*, and *Inverted Window Mask*).
- **Sensor Gestures**: Tilt-to-turn pages with sensitivity thresholds, shake-to-speech audio narration toggle, and edge-swipe vertical brightness adjustments.

### Character Name Replacements & Role Reversal
- **Live Name Replacement Engine**: Dynamically substitutes character names, pronouns, and custom terms across chapter text, headings, drop caps, and audio narration.
- **Collision-Free Multi-Term Algorithm**: Simultaneous single-pass substitution preventing cascading collisions when swapping character roles (e.g. Character A $\leftrightarrow$ Character B).
- **Built-in Role Reversal Presets**: One-tap presets for *Sherlock & Watson Swap*, *Cyberpunk Sci-Fi Twist*, *Modern Tech Investigator*, and *Regal Title Swap*.

### Highlights, Notes & Dictionary
- **Text Highlighting & Anchored Notes**: High-contrast highlight markers with Markdown note attachments and export capability.
- **Instant Offline Dictionary**: Built-in definition lookup overlay complete with phonetics, parts of speech, usage examples, and web search fallback.

### Audio Narration (Text-to-Speech)
- **Background Read-Aloud**: Sentence-by-sentence text-to-speech engine powered by `expo-speech` with dynamic character name substitution support.
- **Playback & Speed Controls**: Variable speech rate (0.5x to 2.5x) with pitch and sleep timer controls (15, 30, 45, or 60 minutes).

### Reading Insights & Habit Analytics
- **365-Day Activity Heatmap**: Visual consistency calendar tracking daily reading frequency and session counts.
- **Streak & Velocity Metrics**: Calculates active reading streaks, lifetime reading hours, words consumed, and reading velocity (WPM).
- **Daily Reading Goals**: Configurable daily target minutes and page milestones with streak preservation logic.

### OPDS Catalogs & Public Domain Library
- **Curated Open Classics**: Instant access to curated public-domain masterpieces (*Meditations*, *Pride and Prejudice*, *The Great Gatsby*, *Frankenstein*, *Walden*) stored directly in your local sandbox.
- **Custom OPDS 1.2 / 2.0 Feeds**: Add and browse custom personal OPDS book catalogs and local network libraries.

### Portable Local Backup & Restore
- **Single-File Container Archive**: Export and import your entire library, annotations, settings, and reading history into a portable `.readr` archive.
- **Zero-Cloud Data Sovereignty**: Merge backups with automatic SHA-256 checksum validation and duplicate prevention.

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

### 4. Run Typecheck and Automated Test Suites
```bash
bun run typecheck  # Strict TypeScript compiler verification (0 errors)
bun test           # Run 111 automated tests across 25 test suites (100% pass)
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

