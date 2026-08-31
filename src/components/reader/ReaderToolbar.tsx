import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import {
  ArrowLeft,
  List,
  Type,
  Palette,
  Volume2,
  Bookmark,
  Search,
} from 'lucide-react-native';

export interface ReaderToolbarProps {
  title: string;
  onBack: () => void;
  onOpenTOC: () => void;
  onOpenTypography: () => void;
  onOpenTheme: () => void;
  onOpenTTS: () => void;
  onOpenAnnotations: () => void;
  onOpenSearch: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title,
  onBack,
  onOpenTOC,
  onOpenTypography,
  onOpenTheme,
  onOpenTTS,
  onOpenAnnotations,
  onOpenSearch,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ] as any}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Book Title */}
      <Text style={[styles.title, { color: colors.textPrimary }] as any} numberOfLines={1}>
        {title}
      </Text>

      {/* Actions */}
      <View style={styles.actionGroup}>
        <TouchableOpacity onPress={onOpenSearch} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Search size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenTTS} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Volume2 size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenTypography} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Type size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenTheme} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Palette size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenAnnotations} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Bookmark size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onOpenTOC} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <List size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    marginHorizontal: 10,
    letterSpacing: -0.2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
