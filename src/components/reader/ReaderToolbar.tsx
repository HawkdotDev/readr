import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import {
  ChevronLeft,
  List,
  Bookmark,
  Search,
  Volume2,
  Sliders,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

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
    <View style={styles.container}>
      {/* Back Button (Circular Pill like image) */}
      <TouchableOpacity
        onPress={onBack}
        style={[
          styles.backCircleBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessible={true}
        accessibilityLabel="Go back to library"
      >
        <ChevronLeft size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Action Group */}
      <View style={styles.actionGroup}>
        {/* Typography & Format (Aa) */}
        <TouchableOpacity
          onPress={onOpenTypography}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessible={true}
          accessibilityLabel="Typography and layout"
        >
          <Text
            style={[
              styles.aaText,
              { color: colors.textPrimary },
            ]}
          >
            Aa
          </Text>
        </TouchableOpacity>

        {/* Table of Contents (List :=) */}
        <TouchableOpacity
          onPress={onOpenTOC}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessible={true}
          accessibilityLabel="Table of Contents"
        >
          <List size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Bookmarks & Annotations */}
        <TouchableOpacity
          onPress={onOpenAnnotations}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessible={true}
          accessibilityLabel="Bookmarks and Highlights"
        >
          <Bookmark size={19} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Audio TTS */}
        <TouchableOpacity
          onPress={onOpenTTS}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessible={true}
          accessibilityLabel="Audio Narration"
        >
          <Volume2 size={19} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* In-Book Search */}
        <TouchableOpacity
          onPress={onOpenSearch}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessible={true}
          accessibilityLabel="Search in book"
        >
          <Search size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aaText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.4,
  },
});
