import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Sun, Moon, Equal, List, Bookmark } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface ReaderBottomCapsuleProps {
  onOpenTypography: () => void;
  onOpenTOC: () => void;
  onOpenAnnotations?: () => void;
}

export const ReaderBottomCapsule: React.FC<ReaderBottomCapsuleProps> = ({
  onOpenTypography,
  onOpenTOC,
  onOpenAnnotations,
}) => {
  const { colors, themeMode, setThemeMode } = useTheme();

  const handleThemeToggle = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    // If currently dark/oled, toggle to light; otherwise toggle to dark
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
    <View style={styles.outerWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.capsule,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowOpacity: colors.isDark ? 0.3 : 0.08,
          },
        ]}
      >
        {/* 1. Single Light/Dark Mode Toggle Button */}
        <TouchableOpacity
          onPress={handleThemeToggle}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={colors.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {colors.isDark ? (
            <Sun size={22} color={colors.textPrimary} strokeWidth={2.0} />
          ) : (
            <Moon size={22} color={colors.textPrimary} strokeWidth={2.0} />
          )}
        </TouchableOpacity>

        {/* 2. Customisation Button */}
        <TouchableOpacity
          onPress={handleTypographyOpen}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Open Typography and Layout Settings"
        >
          <Equal size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* 3. Table of Contents Button (Beside Customisation) */}
        <TouchableOpacity
          onPress={handleTOCOpen}
          style={styles.tabItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Open Table of Contents"
        >
          <List size={22} color={colors.textPrimary} strokeWidth={2.0} />
        </TouchableOpacity>

        {/* 4. Bookmarks and Annotations */}
        {onOpenAnnotations && (
          <TouchableOpacity
            onPress={handleAnnotationsOpen}
            style={styles.tabItem}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Open Bookmarks and Highlights"
          >
            <Bookmark size={21} color={colors.textPrimary} strokeWidth={2.0} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
