import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, BookOpen, Compass, Feather, Bookmark, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';
import { AuthorItem, LibraryBookRef } from '../../services/editorial/libraryAuthorsService';

export interface AuthorDetailModalProps {
  visible: boolean;
  author: AuthorItem | null;
  onClose: () => void;
  onBrowseBooks: (authorName: string) => void;
  onReadBook?: (bookId: string) => void;
}

export const AuthorDetailModal: React.FC<AuthorDetailModalProps> = React.memo(({
  visible,
  author,
  onClose,
  onBrowseBooks,
  onReadBook,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { height: screenHeight } = useWindowDimensions();

  if (!author) return null;

  const sheetHeight = Math.round(screenHeight * 0.86);

  const handleReadBook = (bookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    if (onReadBook) {
      onReadBook(bookId);
    } else {
      router.push(`/reader/${bookId}` as any);
    }
  };

  const handleBrowseCatalog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    onBrowseBooks(author.name);
  };

  const accent = author.accentColor || colors.accent;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Dismiss author details"
        />
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              height: sheetHeight,
              maxHeight: sheetHeight,
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header Row */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.authorHeaderInfo}>
              {/* Author Monogram Crest */}
              <View
                style={[
                  styles.avatarSquare,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: `${accent}40`,
                  },
                ]}
              >
                <Text style={[styles.avatarInitials, { color: accent }]}>
                  {author.initials}
                </Text>
              </View>

              <View style={styles.titleColumn}>
                <Text
                  style={[styles.authorName, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {author.name}
                </Text>

                <View style={styles.badgeRow}>
                  {author.isLibraryAuthor ? (
                    <View
                      style={[
                        styles.libraryBadge,
                        {
                          backgroundColor: `${colors.accent}18`,
                          borderColor: `${colors.accent}40`,
                        },
                      ]}
                    >
                      <Bookmark size={10} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text style={[styles.libraryBadgeText, { color: colors.accent }]}>
                        {author.bookCount || 1} in your library
                      </Text>
                    </View>
                  ) : author.genre ? (
                    <View
                      style={[
                        styles.genreBadge,
                        {
                          backgroundColor: `${accent}16`,
                          borderColor: `${accent}32`,
                        },
                      ]}
                    >
                      <Text style={[styles.genreBadgeText, { color: accent }]}>
                        {author.genre}
                      </Text>
                    </View>
                  ) : null}

                  {author.lifespan && (
                    <Text style={[styles.lifespanText, { color: colors.textSecondary }]}>
                      {author.lifespan}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
              accessible={true}
              accessibilityLabel="Close author description"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollBodyContent}
          >
            {/* Literary Movement Banner */}
            {author.movement && (
              <View
                style={[
                  styles.movementContainer,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Feather size={13} color={accent} style={{ marginRight: 8 }} />
                <Text
                  style={[styles.movementText, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {author.movement}
                </Text>
              </View>
            )}

            {/* Books In Your Library Section */}
            {author.libraryBooks && author.libraryBooks.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  IN YOUR COLLECTION ({author.libraryBooks.length})
                </Text>
                <View style={styles.libraryBooksList}>
                  {author.libraryBooks.map((b: LibraryBookRef) => (
                    <TouchableOpacity
                      key={b.id}
                      activeOpacity={0.8}
                      onPress={() => handleReadBook(b.id)}
                      style={[
                        styles.libraryBookCard,
                        { backgroundColor: colors.canvas, borderColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.bookIconWrap,
                          { backgroundColor: `${accent}16`, borderColor: `${accent}30` },
                        ]}
                      >
                        <BookOpen size={16} color={accent} />
                      </View>
                      <View style={styles.libraryBookInfo}>
                        <Text
                          style={[styles.libraryBookTitle, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {b.title}
                        </Text>
                        <Text style={[styles.libraryBookSub, { color: colors.textSecondary }]}>
                          {b.progress !== undefined && b.progress > 0
                            ? `${Math.round(b.progress > 1 ? b.progress : b.progress * 100)}% completed`
                            : 'Ready to read'}
                        </Text>
                      </View>
                      <View style={[styles.readNowPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.readNowText, { color: colors.accent }]}>Read</Text>
                        <ArrowRight size={11} color={colors.accent} style={{ marginLeft: 3 }} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Biography & Legacy */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                BIOGRAPHY & LITERARY LEGACY
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                {author.description}
              </Text>
            </View>

            {/* Notable Works */}
            {author.famousWorks && author.famousWorks.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  NOTABLE MASTERPIECES
                </Text>
                <View style={styles.worksGrid}>
                  {author.famousWorks.map((work: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.75}
                      onPress={handleBrowseCatalog}
                      style={[
                        styles.workChip,
                        {
                          backgroundColor: colors.canvas,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <BookOpen size={12} color={accent} style={{ marginRight: 6 }} />
                      <Text
                        style={[styles.workChipText, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {work}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View style={[styles.footerBar, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent }]}
              onPress={handleBrowseCatalog}
              accessible={true}
              accessibilityLabel={`Explore books by ${author.name}`}
            >
              <Compass
                size={16}
                color={colors.isDark ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Explore Catalog by {author.name.split(' ').pop()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Backward compatibility alias
export const ArtistDetailModal = AuthorDetailModal;
export type ArtistDetailModalProps = AuthorDetailModalProps;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  authorHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarSquare: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitials: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  titleColumn: {
    flex: 1,
  },
  authorName: {
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
  libraryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  libraryBadgeText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
    letterSpacing: -0.1,
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
    flex: 1,
  },
  scrollBodyContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  movementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  movementText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    letterSpacing: -0.1,
    flex: 1,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  descriptionText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  libraryBooksList: {
    gap: 8,
  },
  libraryBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  libraryBookInfo: {
    flex: 1,
    marginRight: 8,
  },
  libraryBookTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13.5,
    letterSpacing: -0.2,
  },
  libraryBookSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 1,
  },
  readNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  readNowText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11.5,
  },
  worksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  workChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  footerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
});
