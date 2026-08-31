import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/components/common/ThemeProvider';
import { getDatabase } from '../src/db/client';
import { ensureAppDirectories } from '../src/services/storage/fileManager';
import { bootstrapSampleBooksIfEmpty } from '../src/services/storage/sampleBooks';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { APP_FONTS } from '../src/utils/typography';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootNavigation() {
  const { colors, themeMode } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);

  useEffect(() => {
    async function initialize() {
      try {
        await getDatabase();
        await ensureAppDirectories();
        await bootstrapSampleBooksIfEmpty();
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  if (!isReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reader/[id]"
          options={{
            headerShown: false,
            animation: 'fade_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="collection/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="backup/index"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigation />
    </ThemeProvider>
  );
}
