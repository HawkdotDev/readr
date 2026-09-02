import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import {
  ChevronLeft,
  Search,
  Volume2,
  UserCheck,
  Bookmark,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface ReaderToolbarProps {
  title: string;
  onBack: () => void;
  onOpenTTS: () => void;
  onOpenSearch: () => void;
  onOpenNameReplacement?: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  onOpenTypography?: () => void;
  onOpenTOC?: () => void;
  onOpenTheme?: () => void;
  onOpenAnnotations?: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  title,
  onBack,
  onOpenTTS,
  onOpenSearch,
  onOpenNameReplacement,
  onToggleBookmark,
  isBookmarked,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Back Button */}
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

      {/* Top Actions: Role Reversal / Name Replacer, Audio TTS & In-Book Search */}
      <View style={styles.actionGroup}>
        {/* Name Replacement / Role Reversal */}
        {onOpenNameReplacement && (
          <TouchableOpacity
            onPress={onOpenNameReplacement}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessible={true}
            accessibilityLabel="Role Reversal and Name Replacer"
          >
            <UserCheck size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

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

        {/* 1-Tap Bookmark */}
        {onToggleBookmark && (
          <TouchableOpacity
            onPress={onToggleBookmark}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessible={true}
            accessibilityLabel={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          >
            <Bookmark
              size={18}
              color={isBookmarked ? colors.accent : colors.textSecondary}
              fill={isBookmarked ? colors.accent : 'transparent'}
            />
          </TouchableOpacity>
        )}

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


export default ReaderToolbar;

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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
