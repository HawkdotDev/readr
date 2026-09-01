import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Sun, Moon, Equal, List, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface ReaderBottomCapsuleProps {
  onOpenTypography: () => void;
  onOpenTOC: () => void;
  onOpenAnnotations?: () => void;
}

export function ReaderBottomCapsule({
  onOpenTypography,
  onOpenTOC,
  onOpenAnnotations,
}: ReaderBottomCapsuleProps) {
  const { colors, themeMode, setThemeMode } = useTheme();

  const handleThemeToggle = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextMode = colors.isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const handleTypographyOpen = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onOpenTypography();
  };

  const handleTOCOpen = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onOpenTOC();
  };

  const handleAnnotationsOpen = async () => {
    if (!onOpenAnnotations) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onOpenAnnotations();
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.capsule,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* 1. Theme Toggle */}
        <TouchableOpacity
          onPress={handleThemeToggle}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={colors.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {colors.isDark ? (
            <Sun size={20} color={colors.textSecondary} strokeWidth={1.8} />
          ) : (
            <Moon size={20} color={colors.textSecondary} strokeWidth={1.8} />
          )}
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Theme</Text>
        </TouchableOpacity>

        {/* 2. Customisation & Layout */}
        <TouchableOpacity
          onPress={handleTypographyOpen}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Open Customisation Settings"
        >
          <Equal size={20} color={colors.textSecondary} strokeWidth={2.0} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Customisation</Text>
        </TouchableOpacity>

        {/* 3. Table of Contents */}
        <TouchableOpacity
          onPress={handleTOCOpen}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Open Table of Contents"
        >
          <List size={20} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Contents</Text>
        </TouchableOpacity>

        {/* 4. Bookmarks and Highlights */}
        {onOpenAnnotations && (
          <TouchableOpacity
            onPress={handleAnnotationsOpen}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Open Bookmarks and Highlights"
          >
            <Bookmark size={19} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Bookmarks</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default ReaderBottomCapsule;

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 76 : 68,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '88%',
    maxWidth: 360,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: -0.2,
  },
});
