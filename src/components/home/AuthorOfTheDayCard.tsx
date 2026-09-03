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
import {
  Feather,
  Shuffle,
  X,
  ChevronRight,
  Award,
  Quote,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import {
  DailyAuthorSpotlight,
  getAuthorOfTheDay,
  getRandomAuthorSpotlight,
} from '../../services/editorial/dailySpotlightService';
import * as Haptics from 'expo-haptics';

export interface SpotlightAuthorCardProps {
  onPressAuthor?: (author: DailyAuthorSpotlight) => void;
}

export const AuthorOfTheDayCard: React.FC<SpotlightAuthorCardProps> = () => {
  const { colors } = useTheme();
  const [author, setAuthor] = useState<DailyAuthorSpotlight>(() => getAuthorOfTheDay());
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShuffle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setImgError(false);
    const nextAuthor = getRandomAuthorSpotlight(author.id);
    setAuthor(nextAuthor);
  };

  const handleOpenDossier = () => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
    setIsDossierOpen(true);
  };

  // Generate 2-letter initials
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const primaryAccolade = author.notableAwards[0] || 'Celebrated Contemporary Voice';

  return (
    <View style={styles.outerContainer}>
      {/* Section Eyebrow Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Feather size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            SPOTLIGHT AUTHOR
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShuffle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.shuffleBtn}
          accessible={true}
          accessibilityLabel="Discover another spotlight author"
        >
          <Shuffle size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.shuffleText, { color: colors.textSecondary }]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Author Showcase Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.32 : 0.08,
          },
        ]}
      >
        {/* Top Prestige Header Row */}
        <View style={styles.authorHeaderRow}>
          {/* Archival Ex-Libris Seal or Author Portrait */}
          <View
            style={[
              styles.sealWrapper,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.sealMediaContainer}>
              {author.portraitUrl && !imgError ? (
                <Image
                  source={{ uri: author.portraitUrl }}
                  style={styles.authorPhoto}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <View
                  style={[
                    styles.sealInnerRing,
                    {
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Text style={[styles.sealInitials, { color: colors.accent }]}>
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.sealInsigniaBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather size={9} color={colors.accent} />
            </View>
          </View>

          {/* Author Meta Details */}
          <View style={styles.authorMetaCol}>
            <Text style={[styles.datelineText, { color: colors.accent }]}>
              {author.nationality.toUpperCase()} · {author.era.toUpperCase()}
            </Text>

            <Text style={[styles.authorName, { color: colors.textPrimary }]} numberOfLines={1}>
              {author.name}
            </Text>

            <View style={styles.genreRow}>
              <Sparkles size={11} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.genreText, { color: colors.textSecondary }]} numberOfLines={1}>
                {author.primaryGenre}
              </Text>
            </View>
          </View>
        </View>

        {/* Accolade Ribbon Strip */}
        <View
          style={[
            styles.accoladeRibbon,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            },
          ]}
        >
          <Award size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.accoladeRibbonText, { color: colors.textPrimary }]} numberOfLines={1}>
            {primaryAccolade}
          </Text>
        </View>

        {/* Key Works Shelf */}
        <View style={styles.keyWorksSection}>
          <Text style={[styles.keyWorksLabel, { color: colors.textSecondary }]}>
            NOTABLE BIBLIOGRAPHY
          </Text>
          <View style={styles.worksPillWrap}>
            {author.recommendedStartingBooks.slice(0, 2).map((work, idx) => (
              <View
                key={idx}
                style={[
                  styles.workPill,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ]}
              >
                <BookOpen size={11} color={colors.accent} style={{ marginRight: 5 }} />
                <Text style={[styles.workPillText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {work.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Signature Quote Callout */}
        <View
          style={[
            styles.quoteCallout,
            {
              backgroundColor: colors.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderLeftColor: colors.accent,
            },
          ]}
        >
          <Text style={[styles.quoteText, { color: colors.textPrimary }]} numberOfLines={2}>
            "{author.signatureQuote}"
          </Text>
        </View>

        {/* Full-Width Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenDossier}
          style={[
            styles.dossierActionBtn,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.border,
            },
          ]}
          accessible={true}
          accessibilityLabel={`Explore profile and works of ${author.name}`}
        >
          <Text style={[styles.dossierActionText, { color: colors.textPrimary }]}>
            Explore Author Profile & Works
          </Text>
          <ChevronRight size={14} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Author Dossier In-Depth Modal */}
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
                  SPOTLIGHT AUTHOR
                </Text>
                <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                  Author Dossier
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
                accessibilityLabel="Close Author Dossier"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dossierContent}
            >
              {/* Author Hero Block */}
              <View style={styles.authorHeroBlock}>
                <View style={styles.dossierSealRow}>
                  <View
                    style={[
                      styles.dossierSealOuter,
                      {
                        backgroundColor: colors.canvas,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    {author.portraitUrl && !imgError ? (
                      <Image
                        source={{ uri: author.portraitUrl }}
                        style={styles.dossierAuthorPhoto}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={[styles.dossierSealText, { color: colors.accent }]}>
                        {initials}
                      </Text>
                    )}
                  </View>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text style={[styles.dossierAuthorName, { color: colors.textPrimary }]}>
                      {author.name}
                    </Text>
                    <Text style={[styles.dossierAuthorMeta, { color: colors.textSecondary }]}>
                      {author.nationality} · {author.era}
                    </Text>
                    <Text style={[styles.dossierAuthorGenre, { color: colors.accent }]}>
                      {author.primaryGenre}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Why Celebrated Today */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  WHY THEY ARE CELEBRATED TODAY
                </Text>
                <Text style={[styles.dossierBodyText, { color: colors.textPrimary }]}>
                  {author.whyTrending}
                </Text>
              </View>

              {/* Biography */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  BIOGRAPHY & LITERARY IMPACT
                </Text>
                <Text style={[styles.dossierBodyText, { color: colors.textPrimary }]}>
                  {author.bio}
                </Text>
              </View>

              {/* Writing Style */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  SIGNATURE WRITING VOICE
                </Text>
                <Text style={[styles.dossierBodyText, { color: colors.textPrimary }]}>
                  {author.writingStyle}
                </Text>
              </View>

              {/* Signature Quote Card */}
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
                  "{author.signatureQuote}"
                </Text>
                <Text style={[styles.dossierQuoteCite, { color: colors.textSecondary }]}>
                  — {author.name}
                </Text>
              </View>

              {/* Where to Start (Key Works) */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  WHERE TO START · ESSENTIAL BIBLIOGRAPHY
                </Text>
                <View style={styles.worksList}>
                  {author.recommendedStartingBooks.map((work, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.workCard,
                        {
                          backgroundColor: colors.canvas,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.workTitleRow}>
                        <BookOpen size={14} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.workTitle, { color: colors.textPrimary }]}>
                          {work.title}
                        </Text>
                      </View>
                      <Text style={[styles.workDesc, { color: colors.textSecondary }]}>
                        {work.description}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Honors & Accolades */}
              <View style={styles.dossierSection}>
                <Text style={[styles.dossierSectionLabel, { color: colors.accent }]}>
                  HONORS & ACCOLADES
                </Text>
                <View style={styles.awardsWrap}>
                  {author.notableAwards.map((award, i) => (
                    <View
                      key={i}
                      style={[
                        styles.awardChip,
                        {
                          backgroundColor: colors.canvas,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Award size={12} color={colors.accent} style={{ marginRight: 5 }} />
                      <Text style={[styles.awardChipText, { color: colors.textPrimary }]}>
                        {award}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export const SpotlightAuthorCard = AuthorOfTheDayCard;

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 24,
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  authorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sealWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sealMediaContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorPhoto: {
    width: '100%',
    height: '100%',
  },
  sealInnerRing: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInitials: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 20,
    letterSpacing: 1,
  },
  sealInsigniaBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorMetaCol: {
    flex: 1,
    marginLeft: 14,
  },
  datelineText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  authorName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 19,
    lineHeight: 23,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genreText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  accoladeRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  accoladeRibbonText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
    letterSpacing: -0.1,
    flex: 1,
  },
  keyWorksSection: {
    marginBottom: 14,
  },
  keyWorksLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 1,
    marginBottom: 6,
  },
  worksPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  workPillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  quoteCallout: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 2.5,
    borderRadius: 4,
    marginBottom: 16,
  },
  quoteText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  dossierActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dossierActionText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12.5,
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
  authorHeroBlock: {
    marginBottom: 18,
  },
  dossierSealRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dossierSealOuter: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dossierAuthorPhoto: {
    width: '100%',
    height: '100%',
  },
  dossierSealText: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
  },
  dossierAuthorName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  dossierAuthorMeta: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    marginTop: 2,
  },
  dossierAuthorGenre: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    marginTop: 2,
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
  worksList: {
    gap: 10,
  },
  workCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  workTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  workDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  awardsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  awardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  awardChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
  },
});
