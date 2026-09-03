const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(
  __dirname,
  '../node_modules/@expo/metro-config/build/serializer/serializeChunks.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // Fix Windows path separator bug in pathToRegex
  if (!content.includes('// Normalize path separators for cross-platform')) {
    content = content.replace(
      /function pathToRegex\(path\) \{[\s\S]*?return new RegExp\('\^' \+ regexSafePath \+ '\$'\);\s*\}/,
      `// Convert file paths to regex matchers.
function pathToRegex(path) {
    // Normalize path separators for cross-platform (Windows \\ and posix /)
    const normalized = path.replace(/\\\\/g, '/');
    let regexSafePath = normalized.replace(/[-[\\]{}()+?.,^$|#\\s]/g, '\\\\$&');
    regexSafePath = regexSafePath.replace(/\\//g, '[/\\\\\\\\]');
    regexSafePath = regexSafePath.replace(/\\*/g, '.*');
    return new RegExp('^' + regexSafePath + '$', 'i');
}`
    );

    // Fix entry check for Windows paths
    content = content.replace(
      'if (settings.test.test(entry[0])) {',
      'if (settings.test.test(entry[0]) || settings.test.test(entry[0].replace(/\\\\/g, "/"))) {'
    );

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[fix-metro-windows] Successfully patched @expo/metro-config serializeChunks.js for Windows');
  }
}
