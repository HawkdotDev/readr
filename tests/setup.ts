// Headless mocks for React Native and Expo modules in Bun test runner
import { mock } from 'bun:test';

mock.module('@react-native/assets-registry/registry', () => ({
  registerAsset: () => 1,
  getAssetByID: () => null,
}));

mock.module('expo-asset', () => ({
  Asset: {
    fromModule: () => ({ downloadAsync: async () => {}, uri: 'mock_asset' }),
  },
}));

mock.module('expo-sqlite', () => ({
  openDatabaseAsync: async () => ({
    execAsync: async () => {},
    runAsync: async () => ({ lastInsertRowId: 1, changes: 1 }),
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
  }),
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => ({ lastInsertRowId: 1, changes: 1 }),
    getAllSync: () => [],
    getFirstSync: () => null,
  }),
  addDatabaseChangeListener: () => ({ remove: () => {} }),
  deleteDatabaseAsync: async () => {},
  deleteDatabaseSync: () => {},
}));

mock.module('react-native', () => ({
  AppState: {
    addEventListener: () => ({ remove: () => {} }),
    currentState: 'active',
  },
  Platform: {
    OS: 'ios',
    select: (obj: any) => obj.ios || obj.default,
  },
  StyleSheet: {
    create: (styles: any) => styles,
    absoluteFill: {},
    absoluteFillObject: {},
  },
  Dimensions: {
    get: () => ({ width: 390, height: 844 }),
  },
}));

mock.module('expo-speech', () => ({
  speak: () => {},
  stop: () => {},
  isSpeakingAsync: async () => false,
}));

const mockFileSystem = {
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  getInfoAsync: async () => ({ exists: true, size: 2048 }),
  makeDirectoryAsync: async () => {},
  readAsStringAsync: async () => 'sample text content',
  writeAsStringAsync: async () => {},
  copyAsync: async () => {},
  downloadAsync: async () => ({ status: 200, uri: 'file:///mock/cache/download.epub' }),
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
};

mock.module('expo-file-system', () => mockFileSystem);
mock.module('expo-file-system/legacy', () => mockFileSystem);

mock.module('expo-crypto', () => ({
  digestStringAsync: async () => 'sha256_mock_hash_123',
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

mock.module('expo-sharing', () => ({
  isAvailableAsync: async () => true,
  shareAsync: async () => {},
}));

mock.module('expo-document-picker', () => ({
  getDocumentAsync: async () => ({ canceled: true }),
}));

mock.module('expo-keep-awake', () => ({
  useKeepAwake: () => {},
  activateKeepAwakeAsync: async () => {},
  deactivateKeepAwake: async () => {},
}));

mock.module('expo-haptics', () => ({
  impactAsync: async () => {},
  notificationAsync: async () => {},
  selectionAsync: async () => {},
}));
