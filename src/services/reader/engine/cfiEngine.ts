/**
 * EPUB Canonical Fragment Identifier (CFI) Engine
 * Implements standard EPUB 3.0 Canonical Fragment Identifier specification
 * for precise cross-device location bookmarking, highlighting, and range navigation.
 */

export interface ParsedCfiStep {
  index: number;
  id?: string;
}

export interface ParsedCfi {
  spineIndex?: number;
  steps: ParsedCfiStep[];
  characterOffset?: number;
  temporalOffset?: number;
  spatialOffset?: { x: number; y: number };
  isRange?: boolean;
  rangeStart?: ParsedCfi;
  rangeEnd?: ParsedCfi;
  raw: string;
}

/**
 * Validates whether a string conforms to the EPUB CFI specification.
 */
export function isValidCfi(cfi: string): boolean {
  if (!cfi || typeof cfi !== 'string') return false;
  return cfi.startsWith('epubcfi(') && cfi.endsWith(')');
}

/**
 * Parses an EPUB CFI string into structured steps and offsets.
 */
export function parseCfi(cfiString: string): ParsedCfi {
  const clean = cfiString.trim();
  if (!isValidCfi(clean)) {
    return { steps: [], raw: cfiString };
  }

  // Strip epubcfi( and )
  const core = clean.slice(8, -1);

  // Check if it's a range CFI: /parent,/start,/end
  if (core.includes(',')) {
    const parts = core.split(',');
    if (parts.length >= 3) {
      const parentPath = parts[0];
      const startPath = parentPath + parts[1];
      const endPath = parentPath + parts[2];

      return {
        steps: parseCfiSteps(parentPath),
        isRange: true,
        rangeStart: parseCfi(`epubcfi(${startPath})`),
        rangeEnd: parseCfi(`epubcfi(${endPath})`),
        raw: cfiString,
      };
    }
  }

  const steps = parseCfiSteps(core);
  let characterOffset: number | undefined;

  // Extract character offset if present (e.g. :14)
  const offsetMatch = core.match(/:(\d+)$/);
  if (offsetMatch) {
    characterOffset = parseInt(offsetMatch[1], 10);
  }

  // Extract spine index (usually the first step e.g. /6/4[spine_id])
  let spineIndex: number | undefined;
  if (steps.length >= 2) {
    // Standard EPUB spine index is typically step 2 (0-indexed step 1: /6/4 => (4 / 2) - 1 = chapter 1)
    spineIndex = Math.max(0, Math.floor(steps[1].index / 2) - 1);
  }

  return {
    spineIndex,
    steps,
    characterOffset,
    raw: cfiString,
  };
}

/**
 * Parses sequential path steps like /6/4[chap01]!/4/2/10
 */
function parseCfiSteps(path: string): ParsedCfiStep[] {
  const stepRegex = /\/(\d+)(?:\[([^\]]+)\])?/g;
  const steps: ParsedCfiStep[] = [];
  let m: RegExpExecArray | null;

  while ((m = stepRegex.exec(path)) !== null) {
    steps.push({
      index: parseInt(m[1], 10),
      id: m[2] || undefined,
    });
  }

  return steps;
}

/**
 * Generates an EPUB CFI string for a chapter index and character offset.
 */
export function createChapterCfi(chapterIndex: number, characterOffset = 0): string {
  const spineStep = (chapterIndex + 1) * 2;
  return `epubcfi(/6/${spineStep}!/4/2:${characterOffset})`;
}

/**
 * Compares two parsed CFIs chronologically.
 * Returns -1 if cfiA < cfiB, 1 if cfiA > cfiB, and 0 if equal.
 */
export function compareCfi(cfiA: string, cfiB: string): number {
  if (cfiA === cfiB) return 0;

  const parsedA = parseCfi(cfiA);
  const parsedB = parseCfi(cfiB);

  const minSteps = Math.min(parsedA.steps.length, parsedB.steps.length);
  for (let i = 0; i < minSteps; i++) {
    const diff = parsedA.steps[i].index - parsedB.steps[i].index;
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }

  if (parsedA.steps.length !== parsedB.steps.length) {
    return parsedA.steps.length > parsedB.steps.length ? 1 : -1;
  }

  const offsetA = parsedA.characterOffset ?? 0;
  const offsetB = parsedB.characterOffset ?? 0;
  if (offsetA !== offsetB) {
    return offsetA > offsetB ? 1 : -1;
  }

  return 0;
}
