import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Sparkles, Shuffle, X, ChevronRight, BookOpen, Quote } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import { GenerativeEditorialCover } from '../common/GenerativeEditorialCover';
import {
  DailyBookSpotlight,
  getBookOfTheDay,
  getRandomBookSpotlight,
} from '../../services/editorial/dailySpotlightService';
import * as Haptics from 'expo-haptics';

export interface BookOfTheDayCardProps {
  onPressBook?: (book: DailyBookSpotlight) => void;
}

export const BookOfTheDayCard: React.FC<BookOfTheDayCardProps> = () => {
  const { colors } = useTheme();
  const [book, setBook] = useState<DailyBookSpotlight>(() => getBookOfTheDay());
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const handleShuffle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setCoverError(false);
    const nextBook = getRandomBookSpotlight(book.id);
    setBook(nextBook);
  };

  const handleOpenDossier = () => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    setIsDossierOpen(true);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            SPOTLIGHT BOOK
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShuffle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.shuffleBtn}
          accessible={true}
          accessibilityLabel="Discover another book of the day"
        >
          <Shuffle size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.shuffleText, { color: colors.textSecondary }]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Hero Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.28 : 0.08,
          },
        ]}
      >
        <View style={styles.cardMainRow}>
          {/* Cover Left */}
          <View style={[styles.coverWrapper, { borderColor: colors.border }]}>
            {book.coverUrl && !coverError ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={styles.bookCoverImage}
                resizeMode="cover"
                onError={() => setCoverError(true)}
              />
            ) : (
              <GenerativeEditorialCover
                title={book.title}
                author={book.author}
                isCompact={false}
              />
            )}
            <View style={styles.spineSheen} pointerEvents="none" />
          </View>

          {/* Details Right */}
          <View style={styles.detailsCol}>
            <View style={styles.genreBadgeRow}>
              <View
                style={[
                  styles.genreBadge,
                  {
                    backgroundColor: colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.genreBadgeText, { color: colors.accent }]}>
                  {book.genre}
                </Text>
              </View>
              <Text style={[styles.yearText, { color: colors.textSecondary }]}>
                {book.year}
              </Text>
            </View>

            <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {book.title}
            </Text>

            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {book.author}
            </Text>

            <Text style={[styles.tagline, { color: colors.textSecondary }]} numberOfLines={2}>
              {book.tagline}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenDossier}
              style={[
                styles.readUpBtn,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel={`Read about ${book.title}`}
            >
              <Text style={[styles.readUpText, { color: colors.textPrimary }]}>
                Read About This Book
              </Text>
              <ChevronRight size={13} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Accolade Strip */}
        <View style={[styles.accoladeStrip, { borderTopColor: colors.border }]}>
          <Text style={[styles.accoladeText, { color: colors.textSecondary }]} numberOfLines={1}>
            {book.accolade}
          </Text>
        </View>
      </View>

      {/* Book Dossier In-Depth Modal */}
      <Modal
        visible={isDossierOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDossierOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsDossierOpen(false)}>
          <Pressable
            style={[
              styles.dossierContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalEyebrow, { color: colors.accent }]}>
                  CONTEMPORARY SPOTLIGHT
                </Text>
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                  Book Dossier
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsDossierOpen(false)}
                style={[
                  styles.closeModalBtn,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel="Close Dossier"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dossierContent}
            >
              {/* Title & Author Block */}
              <View style={styles.dossierHeroBlock}>
                <Text style={[styles.dossierTitle, { color: colors.textPrimary }]}>
                  {book.title}
                </Text>
                <Text style={[styles.dossierAuthor, { color: colors.textSecondary }]}>
                  by {book.author} · {book.year} · {book.genre}
                </Text>
                <View
                  style={[
                    styles.dossierAccoladeBox,
                    {
                      backgroundColor: colors.canvas,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.dossierAccoladeText, { color: colors.accent }]}>
                    {book.accolade}
                  </Text>
                </View>
              </View>

              {/* Why It's Capturing Attention */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  WHY IT’S POPULAR RIGHT NOW
                </Text>
                <Text style={[styles.dossierBodyText, { color: colors.textPrimary }]}>
                  {book.whyPopular}
                </Text>
              </View>

              {/* Synopsis */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  SYNOPSIS & CORE HOOK
                </Text>
                <Text style={[styles.dossierBodyText, { color: colors.textPrimary }]}>
                  {book.synopsis}
                </Text>
              </View>

              {/* Key Themes */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  KEY THEMES
                </Text>
                <View style={styles.themesWrap}>
                  {book.themes.map((theme, i) => (
                    <View
                      key={i}
                      style={[
                        styles.themeChip,
                        {
                          backgroundColor: colors.canvas,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.themeChipText, { color: colors.textPrimary }]}>
                        {theme}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Key Quote */}
              {book.keyQuote && (
                <View
                  style={[
                    styles.dossierQuoteCard,
                    {
                      backgroundColor: colors.canvas,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Quote size={20} color={colors.accent} style={{ marginBottom: 6 }} />
                  <Text style={[styles.dossierQuoteText, { color: colors.textPrimary }]}>
                    "{book.keyQuote}"
                  </Text>
                  <Text style={[styles.dossierQuoteCite, { color: colors.textSecondary }]}>
                    — {book.title}
                  </Text>
                </View>
              )}

              {/* Discussion Prompt */}
              {book.discussionPrompt && (
                <View style={styles.dossierSection}>
                  <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                    FOOD FOR THOUGHT
                  </Text>
                  <Text
                    style={[
                      styles.dossierBodyText,
                      { color: colors.textSecondary, fontStyle: 'italic' },
                    ]}
                  >
                    {book.discussionPrompt}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  shuffleText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardMainRow: {
    flexDirection: 'row',
  },
  coverWrapper: {
    width: 104,
    height: 154,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
  },
  spineSheen: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 4,
  },
  detailsCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  genreBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  genreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10,
    letterSpacing: -0.1,
  },
  yearText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  tagline: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  readUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  readUpText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  accoladeStrip: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  accoladeText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10.5,
    fontStyle: 'italic',
    letterSpacing: -0.1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  dossierContainer: {
    maxHeight: '86%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  modalHeaderTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dossierContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  dossierHeroBlock: {
    marginBottom: 18,
  },
  dossierTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  dossierAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
    marginTop: 3,
    marginBottom: 10,
  },
  dossierAccoladeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  dossierAccoladeText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
  },
  dossierSection: {
    marginBottom: 18,
  },
  dossierSectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    marginBottom: 6,
  },
  dossierBodyText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  themesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  dossierQuoteCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  dossierQuoteText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  dossierQuoteCite: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
});

export const SpotlightBookCard = BookOfTheDayCard;

