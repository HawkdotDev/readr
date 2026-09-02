import { ThemeColors, TextAlign, ReadingDirection, BionicFixation, HighlightColor } from '../../../types';

export interface FoliateEngineConfig {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  marginHorizontal: number;
  textAlign: TextAlign;
  colors: ThemeColors;
  readingDirection: ReadingDirection;
  bionicReadingEnabled: boolean;
  bionicFixation: BionicFixation;
  paragraphIndent: number;
  paragraphSpacing: number;
  dropCaps: boolean;
  highlights?: Array<{ id: string; selectedText: string; color: HighlightColor }>;
  nameReplacements?: Array<{ findText: string; replaceText: string; isCaseSensitive?: boolean }>;
}

export function generateFoliateHtml(
  chapterHtml: string,
  config: FoliateEngineConfig
): string {
  const {
    fontSize,
    fontFamily,
    lineHeight,
    marginHorizontal,
    textAlign,
    colors,
    readingDirection,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
  } = config;

  const resolvedFont =
    fontFamily === 'System' || !fontFamily
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : `"${fontFamily}", serif`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    :root {
      --readr-canvas: ${colors.canvas};
      --readr-surface: ${colors.surface};
      --readr-border: ${colors.border};
      --readr-text: ${colors.textPrimary};
      --readr-text-secondary: ${colors.textSecondary};
      --readr-accent: ${colors.accent};
      --readr-font-size: ${fontSize}px;
      --readr-line-height: ${lineHeight};
      --readr-margin: ${marginHorizontal}px;
      --readr-text-align: ${textAlign};
      --readr-font-family: ${resolvedFont};
      --readr-para-indent: ${paragraphIndent > 0 ? `${paragraphIndent * 1.5}em` : '0'};
      --readr-para-gap: ${paragraphSpacing * 14}px;
    }

    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      background-color: var(--readr-canvas);
      color: var(--readr-text);
      font-family: var(--readr-font-family);
      font-size: var(--readr-font-size);
      line-height: var(--readr-line-height);
      text-align: var(--readr-text-align);
      overflow: hidden;
      user-select: text;
      -webkit-user-select: text;
    }

    #readr-viewport {
      width: 100vw;
      height: 100vh;
      position: relative;
      background-color: var(--readr-canvas);
      ${readingDirection === 'vertical' ? 'overflow-y: auto; -webkit-overflow-scrolling: touch;' : 'overflow: hidden;'}
    }

    #readr-flow {
      ${
        readingDirection === 'horizontal'
          ? `
        column-width: 100vw;
        column-gap: 0;
        column-fill: auto;
        height: 100vh;
        box-sizing: border-box;
        padding: 76px var(--readr-margin) 72px var(--readr-margin);
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform;
      `
          : `
        padding: 76px var(--readr-margin) 88px var(--readr-margin);
        max-width: 760px;
        margin: 0 auto;
      `
      }
    }

    /* Typography Hierarchy */
    h1, h2, h3, h4, h5, h6 {
      color: var(--readr-text);
      font-weight: 700;
      line-height: 1.3;
      margin-top: 1.4em;
      margin-bottom: 0.6em;
      break-after: avoid;
      page-break-after: avoid;
    }

    h1 { font-size: 1.4em; }
    h2 { font-size: 1.25em; }
    h3 { font-size: 1.1em; }

    p {
      margin-bottom: var(--readr-para-gap);
      text-indent: var(--readr-para-indent);
      orphans: 2;
      widows: 2;
    }

    ${
      dropCaps
        ? `
    p:first-of-type::first-letter {
      font-size: 2.8em;
      float: left;
      line-height: 0.85;
      padding-right: 0.12em;
      font-weight: 800;
      color: var(--readr-accent);
    }
    `
        : ''
    }

    blockquote {
      border-left: 3px solid var(--readr-accent);
      padding-left: 14px;
      margin: 1.2em 0;
      color: var(--readr-text-secondary);
      font-style: italic;
    }

    pre, code {
      font-family: monospace, monospace;
      font-size: 0.9em;
      background: var(--readr-surface);
      border-radius: 6px;
      padding: 2px 6px;
    }

    pre {
      padding: 12px;
      overflow-x: auto;
      margin: 1em 0;
      border: 1px solid var(--readr-border);
    }

    hr {
      border: none;
      height: 1px;
      background-color: var(--readr-border);
      margin: 2em 0;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.2em auto;
      border-radius: 8px;
      cursor: pointer;
    }

    /* Footnotes & Citations */
    a[href^="#"], .footnote-ref, [epub\\:type="noteref"] {
      color: var(--readr-accent);
      text-decoration: none;
      font-size: 0.8em;
      vertical-align: super;
      padding: 2px 4px;
      font-weight: 700;
    }

    /* Highlighting */
    mark.readr-hl-yellow { background-color: rgba(245, 158, 11, 0.32); border-radius: 3px; }
    mark.readr-hl-mint { background-color: rgba(16, 185, 129, 0.32); border-radius: 3px; }
    mark.readr-hl-sky { background-color: rgba(14, 165, 233, 0.32); border-radius: 3px; }
    mark.readr-hl-coral { background-color: rgba(244, 63, 94, 0.32); border-radius: 3px; }
    mark.readr-hl-charcoal { background-color: rgba(63, 63, 70, 0.32); border-radius: 3px; }
  </style>
</head>
<body>
  <div id="readr-viewport">
    <div id="readr-flow">
      ${chapterHtml}
    </div>
  </div>

  <script>
    (function() {
      const isHorizontal = ${readingDirection === 'horizontal'};
      const flow = document.getElementById('readr-flow');
      const viewport = document.getElementById('readr-viewport');
      let currentPage = 0;
      let totalPages = 1;

      function post(msg) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }

      function recalculatePages() {
        if (!isHorizontal) return;
        const screenW = window.innerWidth;
        totalPages = Math.max(1, Math.ceil(flow.scrollWidth / screenW));
        post({
          type: 'pageTurn',
          page: currentPage + 1,
          totalPages: totalPages,
          progress: Math.round(((currentPage + 1) / totalPages) * 100)
        });
      }

      window.turnPage = function(delta) {
        if (!isHorizontal) return;
        const next = currentPage + delta;
        if (next >= 0 && next < totalPages) {
          currentPage = next;
          flow.style.transform = 'translate3d(' + (-currentPage * window.innerWidth) + 'px, 0, 0)';
          recalculatePages();
        } else if (next >= totalPages) {
          post({ type: 'nextChapter' });
        } else if (next < 0) {
          post({ type: 'prevChapter' });
        }
      };

      // Tap Navigation Listener
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      document.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      }, { passive: true });

      document.addEventListener('touchend', function(e) {
        const touchDuration = Date.now() - touchStartTime;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Swipe Gesture
        if (isHorizontal && touchDuration < 400 && Math.abs(deltaX) > 40 && Math.abs(deltaY) < 50) {
          if (deltaX < 0) {
            window.turnPage(1);
          } else {
            window.turnPage(-1);
          }
          return;
        }

        // Tap Gesture (Duration < 260ms, dist < 15px)
        if (touchDuration < 260 && Math.hypot(deltaX, deltaY) < 15) {
          const screenW = window.innerWidth;
          const ratioX = touchEndX / screenW;

          if (ratioX < 0.22) {
            if (isHorizontal) window.turnPage(-1);
            else post({ type: 'prevChapter' });
          } else if (ratioX > 0.78) {
            if (isHorizontal) window.turnPage(1);
            else post({ type: 'nextChapter' });
          } else {
            post({ type: 'toggleChrome' });
          }
        }
      }, { passive: true });

      // Image Click Lightbox Interceptor
      document.querySelectorAll('img').forEach(function(img) {
        img.addEventListener('click', function(e) {
          e.stopPropagation();
          post({
            type: 'imageClick',
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            caption: img.getAttribute('title') || ''
          });
        });
      });

      // Footnote Link Interceptor
      document.querySelectorAll('a[href^="#"], .footnote-ref, [epub\\\\:type="noteref"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const targetId = (link.getAttribute('href') || '').replace('#', '');
          let noteText = '';
          if (targetId) {
            const el = document.getElementById(targetId);
            if (el) noteText = el.innerText || el.textContent || '';
          }
          post({
            type: 'footnote',
            id: targetId,
            number: link.innerText || 'Note',
            text: noteText || 'Footnote reference.'
          });
        });
      });

      // Text Selection Listener
      document.addEventListener('selectionchange', function() {
        const sel = window.getSelection();
        const text = sel ? sel.toString().trim() : '';
        if (text && text.length > 2) {
          post({
            type: 'selection',
            text: text
          });
        }
      });

      // Live Dynamic Styling Bridge (Zero Reloads)
      window.ReadrEngine = {
        updateConfig: function(cfg) {
          const root = document.documentElement;
          if (cfg.colors) {
            root.style.setProperty('--readr-canvas', cfg.colors.canvas);
            root.style.setProperty('--readr-surface', cfg.colors.surface);
            root.style.setProperty('--readr-border', cfg.colors.border);
            root.style.setProperty('--readr-text', cfg.colors.textPrimary);
            root.style.setProperty('--readr-text-secondary', cfg.colors.textSecondary);
            root.style.setProperty('--readr-accent', cfg.colors.accent);
          }
          if (cfg.fontSize) root.style.setProperty('--readr-font-size', cfg.fontSize + 'px');
          if (cfg.lineHeight) root.style.setProperty('--readr-line-height', cfg.lineHeight);
          if (cfg.marginHorizontal) root.style.setProperty('--readr-margin', cfg.marginHorizontal + 'px');
          if (cfg.textAlign) root.style.setProperty('--readr-text-align', cfg.textAlign);
          if (isHorizontal) recalculatePages();
        }
      };

      // Initial page calculation
      window.addEventListener('load', recalculatePages);
      window.addEventListener('resize', recalculatePages);
      setTimeout(recalculatePages, 120);
    })();
  </script>
</body>
</html>`;
}
