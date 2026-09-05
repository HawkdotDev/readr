# Expo Production & Memory Optimization Playbook

A working checklist for shipping a memory-lean, production-ready Expo app, current as of Expo SDK 57 (React Native 0.86, React 19.2). Includes a dedicated deep-dive for complex ebook reader apps (§5).

---

## ⚠️ Two things to check this week

**1. If any project is on SDK 55 or 56 and uses Reanimated/Worklets (animations, gestures) — upgrade to `expo@57.0.9` or later.**
SDK 55/56 shipped with a Hermes v1 bug where simply *importing* `react-native-reanimated` or `react-native-worklets` — whether or not you actively use them — could inflate Android memory usage by roughly 25–30%. It's fixed in `expo@57.0.9+` (which pulls in React Native 0.86.2). If you can't upgrade immediately, enabling **Worklets Bundle Mode** is the interim workaround, though Expo doesn't yet recommend it for production.

**2. The Legacy Architecture is gone as of SDK 55.** Every app now runs on Fabric + TurboModules + JSI (the "New Architecture") whether you opted in or not — `newArchEnabled` was removed from `app.json` entirely. If a project (or a third-party native module in it) still assumes the old bridge, that's worth auditing before it becomes a build-breaking surprise.

---

## 1. Framework foundation

- **Track the SDK, don't fall far behind it.** Current is SDK 57. Since SDK 55, every Expo SDK package shares the SDK's major version number, so version drift across packages is easier to spot.
- **Run `bunx expo-doctor` before every release build.** It catches version mismatches (a very common cause of native build failures, especially between `react`, `react-native`, and native libs like Reanimated) — including a silently missing peer dependency.
- **Use `bunx expo install --check` to auto-align dependencies.** When `expo-doctor` flags package version drift against the SDK matrix, this command resolves and upgrades them to the blessed versions without manual guesswork.
- **If using Reanimated 4.x, confirm `react-native-worklets` is listed as an explicit dependency.** Reanimated 4 requires it directly, not just transitively — install via `bunx expo install react-native-worklets` so native binaries match the exact SDK release.
- **Prune legacy type packages once RN itself ships types.** Modern React Native bundles its own TypeScript types; an old `@types/react-native` sitting in `devDependencies` next to a current RN version is usually dead weight and occasionally a source of type conflicts.
- **Don't hand-edit `/ios` and `/android`.** `expo prebuild` now clears and regenerates those directories by default (Continuous Native Generation). Anything you need natively should go through a **config plugin** — otherwise your changes silently vanish on the next prebuild.
- **Prefer the Expo Modules API for any custom native code.** Modules written against it get New Architecture support (including bridgeless mode) for free.
- **Use a development build, not Expo Go**, once you need any native module Expo Go doesn't ship. This is what makes "managed Expo" production-viable — you keep EAS Build/Update while still owning full native code.
- **On Bun: it's auto-detected, no extra config needed.** Both Expo CLI and EAS Build pick the package manager from the lockfile in the repo — as long as `bun.lock`/`bun.lockb` is committed and `packageManager` in `package.json` is accurate, EAS builds use Bun automatically.
- **Still install through Expo, not bare Bun.** Use `bunx expo install <package>` (or `bun expo install <package>`) instead of `bun add <package>` for anything in the Expo/React Native ecosystem — it resolves the version compatible with your current SDK rather than just the latest release, which is what causes most of the version-mismatch failures `expo-doctor` catches in the first place.

## 2. Memory optimization — JavaScript & rendering

- **Clean up everything that outlives a component**: `setInterval`/`setTimeout`, event listeners, subscriptions, WebSocket connections. Always pair them with a cleanup function in `useEffect` — this is the single most common source of RN memory leaks.
- **Memoize selectively, not reflexively.** `useMemo`/`useCallback`/`React.memo` only pay off when either the computation is genuinely expensive, or the memoized value is a prop into a `React.memo`-wrapped child. Blanket memoization adds its own overhead and objects to garbage-collect.
- **Replace `FlatList`/`ScrollView` with `@shopify/flash-list`** for any list of meaningful length. `FlatList` mounts/unmounts DOM-equivalent nodes as you scroll, which churns memory; FlashList's cell-recycling keeps memory usage close to constant regardless of list length. Always specify an accurate `estimatedItemSize` to prevent layout measurement thrashing.
- **Never hold a full large dataset in React state.** Paginate, windowed-render, or keep the canonical copy in SQLite/disk and only pull the visible slice into state.
- **Use atomic state selectors, not broad store destructuring.** In stores like Zustand or Redux, calling `const { fontSize } = useReaderStore()` causes the component to re-render whenever *any* unrelated store value changes (like reading progress, scroll offsets, or timer ticks). Always write atomic selectors: `const fontSize = useReaderStore((s) => s.fontSize)` or use shallow diffing (`useShallow`) to eliminate wasteful re-render cycles.
- **Defer non-critical work during transitions with `InteractionManager`.** Never trigger heavy SQLite indexing, chapter pre-parsing, or cache cleanup while screen push/pop transitions or drawer gestures are actively animating. Defer them with `InteractionManager.runAfterInteractions(() => { ... })` to preserve smooth 60/120 FPS transitions.
- **Watch the JS heap, not just visual smoothness** — a screen can look fine while steadily leaking memory that only shows up as a crash three screens later.

## 3. Memory optimization — images & media

- **Use `expo-image`, not the core `Image` component**, in every Expo project. It wraps native image pipelines (Glide/Coil on Android, equivalent on iOS) that handle async decoding, disk+memory caching, and downsampling off the JS/UI thread — the default `Image` does very little of this.
- **Decode at the size you'll render, not the source size.** A 4000×3000 photo (or comic-book page) shown in a 200×200 thumbnail still costs full-resolution decode memory unless you resize (`expo-image-manipulator`, or a pre-resized asset).
- **Set `cachePolicy` deliberately** (`memory-disk` is the common default) and use `prefetch()` narrowly — e.g., only the next page of a paginated grid or the images currently in the viewport of a `FlashList`, driven by `onViewableItemsChanged`. Blanket-prefetching a whole catalog defeats the purpose.
- **Prefer WebP/AVIF over PNG/JPEG** for bundled assets — WebP alone typically saves 25–34% over JPEG at equivalent quality, and both formats decode natively via `expo-image`.
- **Set `priority` inside virtualized lists** so on-screen images decode before off-screen ones.

## 4. Memory optimization — large files, documents & native parsing

This section matters for any app parsing or rendering large user files (a book/e-reader app handling EPUB, PDF, MOBI, CBZ/CBR being the canonical case — see §5 for a full format-by-format deep dive).

- **Stream, don't slurp.** The modern `expo-file-system` API (object-oriented `File`/`Directory`, stable since SDK 54, feature-complete as of SDK 56) supports resumable, progress-reporting downloads and is built around `SharedObjects` — native-side handles rather than JS-copied buffers. Avoid `readAsStringAsync()` on anything large; it pulls the entire file into a JS string in memory at once.
- **Never hold a fully-decoded document in memory.** Parse and render incrementally rather than decoding a whole document into a JS object tree up front.
- **Push CPU/memory-heavy parsing into native code**, not pure-JS. A JS-side parser runs on (and retains memory on) the JS heap; a native parsing module keeps that pressure off Hermes entirely and is usually faster.
- **Audit SQLite usage for leaks and configure memory-bounding pragmas.** Make sure statements/cursors are finalized, batch writes instead of one transaction per row, and never pull an entire large result set into memory just to filter it in JS — filter in the query. Always apply lightweight memory pragmas upon opening connections:
  - `PRAGMA journal_mode = WAL;` (enables concurrent non-blocking reads and atomic writes).
  - `PRAGMA cache_size = -4000;` (bounds SQLite's in-memory page cache to ~4MB instead of default unbounded growth).
  - `PRAGMA mmap_size = 0;` (disables 256MB+ virtual memory mmap allocation that inflates resident memory on mobile).
  - `PRAGMA temp_store = FILE;` (prevents in-memory temp tables from inflating RAM during complex queries).
- **Explicitly release reader-screen state on navigation away** (decoded pages, image caches, parsed chapter trees) rather than relying on the screen simply unmounting — some caches (image cache, native module singletons) outlive the component tree unless told otherwise.

## 5. Ebook reader deep-dive: archives, rendering & multi-format

For readers supporting a real format spread — EPUB, PDF, MOBI, AZW3, CBZ, CBR, FB2, DOCX and similar — the "large file" problem shows up as several distinct, format-specific failure modes:

- **Archive-based formats (EPUB, CBZ, DOCX are all zip containers) — extract to disk, don't decompress to memory.** A pure-JS unzip library (e.g. JSZip) pulls the entire archive into memory as JS buffers to give you access to it — for a full CBZ of manga pages or a long EPUB, that's the single biggest avoidable memory spike in a reader app. Prefer a native unzip-to-disk library (e.g. `react-native-zip-archive`) so extraction happens once, produces loose files on disk, and every subsequent read goes through `expo-file-system` on demand — nothing lives in the JS heap except the page/chapter currently open.
- **Non-archive formats need the same discipline in a different shape.** FB2 is XML — stream-parse it rather than building a full DOM for a 500-page book. MOBI/AZW3 are proprietary binary formats; whatever parser you use, favor one that seeks/reads incrementally over one that loads the full file to parse it.
- **PDF rendering: never rasterize the whole document up front.** Render pages lazily around the current position (current ± a small window), and explicitly release rasterized bitmaps for pages that scroll out of that window — the same windowing discipline as a virtualized list, applied to page bitmaps instead of list rows.
- **WebView-based rendering (common for EPUB HTML) is one of the heaviest primitives available.** Each `WebView` is a real embedded browser engine instance. Preloading the next/previous chapter in separate WebView instances for smooth paging compounds fast on long books — prefer a single reused WebView with content swapped via `injectJavaScript`/`postMessage`. Explicitly clear it (don't just unmount) when the user leaves a book; Android's system WebView is notorious for not releasing memory cleanly on its own.
- **Text-to-speech: chunk, don't queue the whole book.** Feed `expo-speech` paragraph-by-paragraph or sentence-by-sentence rather than queuing an entire chapter/book's text as one utterance, and stop + clear the queue immediately on navigating away from the reading screen or backgrounding the app.
- **Per-book state (reading position, bookmarks, highlights) in SQLite is the right call — keep it scoped.** Query only the current book's rows, not the whole library, and avoid loading full-library metadata into memory at once for the library/shelf view — page it the same way you'd page any other long list (see §2).
- **Custom fonts add real startup cost — and check for duplicates.** Bundling several font families for reading customization means shipping every weight/style variant unless trimmed: audit which weights are actually reachable in the UI and drop the rest, and load rarely-used display fonts lazily rather than at app launch. Also check whether the same family is being pulled in twice through two different packages — easy to do when a font is available both via a general-purpose distribution library like `@fontsource/*` and via Expo's own `@expo-google-fonts/*` catalog. If a font is on Google Fonts, prefer the `@expo-google-fonts/*` version: it's built for React Native and lets you import only the exact static weights you use, rather than a package designed around web/CSS delivery.
- **Retire polyfills once their reason for existing goes away.** A binary shim like the Node `Buffer` polyfill is often pulled in only to support one specific library — a JS-side zip/archive parser is a common source. When that library gets replaced with a native-backed alternative (per the archive-format point above), check whether the polyfill is now orphaned and safe to drop: one less shim in the bundle, and one less place binary data sits as JS-heap objects instead of native buffers.

## 6. API, network & remote data optimization

For apps fetching remote book catalogs (OPDS, OpenLibrary, Project Gutenberg), syncing reading progress, or resolving covers and dictionaries, network discipline is just as critical as JS heap discipline:

- **Stream remote files directly to disk — never buffer in JS heap.** When downloading EPUBs, PDFs, or audiobooks, never use `fetch()` and convert to `.blob()`, `.arrayBuffer()`, or `.text()` — doing so copies the entire multi-megabyte payload into Hermes JS memory, causing severe memory spikes and Garbage Collector pauses. Always stream directly to disk using `expo-file-system` `FileSystem.createDownloadResumable()` or modern `File.downloadFileAsync()`.
- **Enforce mandatory request cancellation via `AbortController`.** Every network request initiated by a screen or component (OPDS feed navigation, book search, dictionary lookups) must take an `AbortSignal`. Abort in the `useEffect` cleanup return to terminate in-flight sockets, free native buffers, and prevent state updates on unmounted screens.
- **Coalesce in-flight requests (Deduplication).** Prevent thundering-herd issues where multiple components or list cells simultaneously fetch the same author bio, book metadata, or cover image. Cache the active in-flight `Promise` in a module-level `Map<string, Promise<T>>` so concurrent consumers share a single network call.
- **Use conditional requests (`ETag` / `304 Not Modified`) & disk-backed caching.** Store `ETag` and `Last-Modified` headers alongside catalog feeds in SQLite. Always send `If-None-Match` on subsequent requests; receiving a `304` skips payload transfer, JSON/XML deserialization, and heap allocation entirely.
- **Always set explicit request timeouts.** React Native's standard `fetch()` has no default timeout — on weak cellular networks, stalled TCP sockets can hang indefinitely, leaking memory and silently draining battery. Always wrap requests with an explicit 10s–15s timeout via `AbortSignal.timeout(15000)`.
- **Be network-state aware before syncing (`NetInfo`).** Avoid firing failing network queries or retries when the device is offline or in airplane mode. Query `@react-native-community/netinfo` before background sync, and queue mutations in SQLite to drain in an idempotent batch once connectivity resumes.
- **Stream and paginate XML/Atom feeds (OPDS).** OPDS catalogs are XML Atom feeds. Parsing a large 500-item feed with a pure-JS DOM parser generates tens of thousands of temporary JS nodes. Always request paginated chunks (`?page=1&size=20`) and use a streaming or SAX-style parser instead of in-memory DOM building.

## 7. Bundle size & startup footprint

- **Profile before optimizing blind.** Run `EXPO_UNSTABLE_ATLAS=true bunx expo start` and press Shift+M → "Open expo-atlas", or `EXPO_UNSTABLE_ATLAS=true bunx expo export` for a production-accurate report. Atlas maps Metro's actual dependency graph, so it doesn't leave the "unmapped regions" generic source-map tools do.
- **Enable tree-shaking** (`EXPO_UNSTABLE_TREE_SHAKING=1` or `experimentalImportSupport`/`inlineRequires` in `metro.config.js`) so unused exports — including from barrel files (`export * from`) — get eliminated instead of bundled whole.
- **Strip `console.*` calls from production builds** with `babel-plugin-transform-remove-console`. Every log call serializes its arguments across the bridge/JSI boundary; in a release build it's pure overhead (and a minor security leak via `adb logcat`).
- **Ship Android as an AAB, not an APK** — an instant 30–40% smaller download with zero code changes.
- **Confirm Hermes is on** (`jsEngine: "hermes"`, the modern default) and let bytecode diffing (default since SDK 56) keep OTA update payloads small.
- **Lazy-load rarely-hit screens/heavy libraries** rather than importing everything at the entry point — this shrinks both bundle size and cold-start memory.

## 8. Profiling — measure, don't guess

- **In-app Performance Monitor** (Dev Menu): live RAM, JS heap, view count, and FPS for both UI and JS threads — the fastest sanity check while developing.
- **React Native DevTools → Memory panel**: take a heap snapshot or record an allocation timeline to spot what's actually retaining memory over time. (If the Memory panel disconnects on Android in your RN version, a known open issue, a CDP-script-based heap snapshot is the fallback.)
- **Android Studio Profiler / Xcode Instruments** for anything the JS-side tools can't see — native bitmap memory, WebView memory, camera/video buffers, retain cycles in native modules.
- **Always validate on a real, mid/low-end device**, not just a simulator or your own flagship phone. Memory pressure and GC behavior on a 3–4 year old Android device look nothing like a simulator — and matters even more for a reader app people keep open for hours.
- **Measure before and after every optimization** — "it feels smoother" isn't a metric; a heap snapshot diff is.

## 9. EAS build & release pipeline

- **Three `eas.json` profiles minimum**: `development`, `preview`, `production` — never test production behavior off a development build.
- **Any native-layer change requires a fresh EAS Build and store submission**, not an OTA update: a new native module, an `app.json`/`expo-build-properties` change, or a New Architecture-affecting dependency bump.
- **EAS Update (OTA) rules of thumb:**
  - OTA is for fixes and refinements, not new features that need a native module — those need a real build regardless.
  - Keep the update **channel tied to the build profile** — pushing a production JS bundle onto a differently-compiled native runtime is how apps get bricked in the wild.
  - Never OTA a change that alters what your app writes/reads without a matching backend deploy landing first (less relevant for a fully local/offline app, but worth remembering the moment any sync exists).
  - Always know your rollback command (`eas update:rollback`) *before* you need it.
- **Let EAS manage signing credentials** rather than hand-rolling keystores/certificates — it removes a whole class of release-day surprises.

## 10. Reliability & observability

- **Wire crash reporting (Sentry or Crashlytics) before your first external tester**, with source maps uploaded automatically on every EAS build. A minified stack trace with no source map is close to unreadable, and you can't retroactively generate maps for a build you already shipped.
- **Add error boundaries** around major navigation/screen boundaries so one broken screen doesn't take down the whole app — for a reader, wrap the reading screen itself so a malformed file can't crash the whole library.
- **Store anything sensitive (tokens, credentials, purchase receipts) in `expo-secure-store`**, not AsyncStorage or plain files — this applies even to fully local/offline apps.

## 11. Store & config readiness

- **Migrate `splash` to `expo-splash-screen` config plugin.** In modern Expo SDKs (SDK 55+), top-level `"splash"` in `app.json` is deprecated and fails `expo-doctor` schema validation (`should NOT have additional property 'splash'`). Move splash configuration into the plugins array: `["expo-splash-screen", { "image": "...", "resizeMode": "contain", "backgroundColor": "..." }]`.
- **Trim requested permissions to exactly what's used** — over-asking is one of the most common App Store/Play Store review rejections.
- **Declare background audio permissions for TTS.** If text-to-speech should run with the screen locked or the app backgrounded, verify iOS `infoPlist.UIBackgroundModes: ["audio"]` and Android `FOREGROUND_SERVICE` / `WAKE_LOCK` permissions are declared in `app.json`.
- **If the app ever supports accounts, it must support in-app account deletion** — reviewers check for this specifically.
- **Configure `app.config` properly for icons, splash, and permission usage strings** before your first submission build; getting these wrong is a guaranteed rejection round-trip.
- **Check local disk space before a local (non-EAS) build** — several GB free is typical, and running out mid-build is a confusing failure mode.

## 12. Testing & CI

- **Run `expo-doctor` and TypeScript/lint checks in CI**, gated on every PR, not just before releases.
- **Add a handful of end-to-end smoke tests** (Maestro or Detox) covering the 3–5 flows that would be catastrophic if broken — app launch, core navigation, and (for a reader) opening and rendering one file per supported format.
- **Set a bundle-size budget in CI** (via Atlas output) so a PR that meaningfully grows the bundle gets flagged automatically rather than discovered after release.

---

## Quick-reference checklist

- [ ] On `expo@57.0.9`+ if using Reanimated/Worklets anywhere
- [ ] `bunx expo-doctor` passes clean, with `react-native-worklets` installed directly for Reanimated 4.x
- [ ] Mismatched packages reconciled via `bunx expo install --check`
- [ ] Legacy `@types/react-native` pruned from `devDependencies`
- [ ] All lists >20 items use `@shopify/flash-list` with `estimatedItemSize`
- [ ] Atomic store selectors used instead of whole-store destructuring
- [ ] Heavy background work deferred during screen transitions with `InteractionManager`
- [ ] All images use `expo-image` with a deliberate `cachePolicy`
- [ ] SQLite configured with memory-bounding pragmas (`WAL`, `cache_size = -4000`, `mmap_size = 0`)
- [ ] Remote file downloads streamed directly to disk (never buffered into JS memory)
- [ ] All network requests bounded by `AbortController` cancellation and explicit timeouts
- [ ] In-flight request deduplication and conditional caching (`ETag` / `304`) in place
- [ ] Network connectivity verified via `NetInfo` before background sync/retries
- [ ] Archive-based formats (EPUB/CBZ/DOCX) extracted to disk via native unzip, not decompressed fully into memory
- [ ] Non-archive formats (PDF/MOBI/AZW3/FB2) parsed/rendered incrementally, not loaded whole
- [ ] WebView instances reused/cleared rather than multiplied per chapter
- [ ] TTS chunked per paragraph/sentence, stopped on navigation away, and background audio declared
- [ ] Library/shelf view paginated, not loading full catalog metadata at once
- [ ] Splash screen configured via `expo-splash-screen` plugin rather than root `splash` in `app.json`
- [ ] `EXPO_UNSTABLE_ATLAS` bundle report reviewed, console logs stripped in production
- [ ] Heap snapshot taken on a real mid-range device before release
- [ ] `eas.json` has separate dev/preview/production profiles
- [ ] Crash reporting + source maps wired before first external test
- [ ] `expo-secure-store` used for any sensitive local data