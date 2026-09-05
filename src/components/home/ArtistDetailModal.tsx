import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { X, BookOpen, Sparkles, Compass, Feather } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import { ArtistItem } from './ArtistsSection';
import * as Haptics from 'expo-haptics';

export interface ArtistDetailModalProps {
  visible: boolean;
  artist: ArtistItem | null;
  onClose: () => void;
  onBrowseBooks: (artistName: string) => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = React.memo(({
  visible,
  artist,
  onClose,
  onBrowseBooks,
}) => {
  const { colors } = useTheme();

  if (!artist) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Dismiss artist details"
        />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
        >
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.artistHeaderInfo}>
              {/* Square avatar with rounded corners */}
              <View
                style={[
                  styles.avatarSquare,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarInitials,
                    { color: artist.accentColor || colors.accent },
                  ]}
                >
                  {artist.initials}
                </Text>
              </View>

              <View style={styles.titleColumn}>
                <Text
                  style={[styles.artistName, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {artist.name}
                </Text>

                <View style={styles.badgeRow}>
                  {artist.genre && (
                    <View
                      style={[
                        styles.genreBadge,
                        {
                          backgroundColor: `${artist.accentColor || colors.accent}18`,
                          borderColor: `${artist.accentColor || colors.accent}33`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.genreBadgeText,
                          { color: artist.accentColor || colors.accent },
                        ]}
                      >
                        {artist.genre}
                      </Text>
                    </View>
                  )}

                  {artist.lifespan && (
                    <Text
                      style={[styles.lifespanText, { color: colors.textSecondary }]}
                    >
                      {artist.lifespan}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessible={true}
              accessibilityLabel="Close artist description"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollBodyContent}
          >
            {/* Literary Movement */}
            {artist.movement && (
              <View style={styles.movementContainer}>
                <Feather size={13} color={colors.accent} style={{ marginRight: 6 }} />
                <Text
                  style={[styles.movementText, { color: colors.textSecondary }]}
                >
                  {artist.movement}
                </Text>
              </View>
            )}

            {/* Biography & Description */}
            <View style={styles.sectionBlock}>
              <Text
                style={[styles.sectionHeading, { color: colors.textSecondary }]}
              >
                BIOGRAPHY & LITERARY IMPACT
              </Text>
              <Text
                style={[styles.descriptionText, { color: colors.textPrimary }]}
              >
                {artist.description}
              </Text>
            </View>

            {/* Notable Works */}
            {artist.famousWorks && artist.famousWorks.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text
                  style={[styles.sectionHeading, { color: colors.textSecondary }]}
                >
                  NOTABLE MASTERPIECES
                </Text>
                <View style={styles.worksGrid}>
                  {artist.famousWorks.map((work, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.workChip,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <BookOpen size={12} color={colors.accent} style={{ marginRight: 6 }} />
                      <Text
                        style={[styles.workChipText, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {work}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onClose();
              onBrowseBooks(artist.name);
            }}
            accessible={true}
            accessibilityLabel={`Explore books by ${artist.name}`}
          >
            <Compass size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 8 }} />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.isDark ? '#000000' : '#FFFFFF' },
              ]}
            >
              Explore Books by {artist.name.split(' ').pop()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  artistHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarSquare: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontFamily: FONTS.mona.bold,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  titleColumn: {
    flex: 1,
  },
  artistName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  genreBadgeText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  lifespanText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    maxHeight: 320,
  },
  scrollBodyContent: {
    paddingVertical: 14,
  },
  movementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  movementText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  descriptionText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13.5,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  worksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  workChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 10,
  },
  actionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
});
