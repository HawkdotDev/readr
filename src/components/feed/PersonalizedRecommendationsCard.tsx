import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OptimizedImage } from '../common/OptimizedImage';
import { Book } from '../../types';
import { RecommendedBook } from '../../services/recommendations/recommendationService';
import { FONTS } from '../../utils/typography';
import {
  Sparkles,
  BookOpen,
  Download,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react-native';

export interface PersonalizedRecommendationsCardProps {
  recommendations: RecommendedBook[];
  books: Book[];
  downloadingId?: string | null;
  onDownload: (title: string, author: string, downloadUrl: string, coverUrl?: string) => void;
  onOpenBook: (bookId: string) => void;
  onSeeAllPress: () => void;
}

export const PersonalizedRecommendationsCard: React.FC<PersonalizedRecommendationsCardProps> = ({
  recommendations,
  books,
  downloadingId,
  onDownload,
  onOpenBook,
  onSeeAllPress,
}) => {
  const { colors } = useTheme();

  if (recommendations.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            RECOMMENDED FOR YOUR SHELF
          </Text>
        </View>

        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllRow}>
          <Text style={[styles.seeAllText, { color: colors.accent }]}>Catalog</Text>
          <ArrowUpRight size={13} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.recGrid}>
        {recommendations.map((rec) => {
          const ownedBook = books.find(
            (b) => b.title.toLowerCase().trim() === rec.title.toLowerCase().trim()
          );
          const isOwned = Boolean(ownedBook);
          const isDownloading = downloadingId === rec.id;

          return (
            <View
              key={rec.id}
              style={[
                styles.recCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.recCardTop}>
                {rec.coverUrl ? (
                  <OptimizedImage
                    source={{ uri: rec.coverUrl }}
                    style={styles.recCover}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.recCoverFallback,
                      { backgroundColor: colors.canvas, borderColor: colors.border },
                    ]}
                  >
                    <BookOpen size={20} color={colors.accent} />
                  </View>
                )}

                <View style={styles.recDetails}>
                  <View
                    style={[
                      styles.recReasonBadge,
                      {
                        backgroundColor: colors.isDark
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(245, 158, 11, 0.1)',
                      },
                    ]}
                  >
                    <Text style={[styles.recReasonText, { color: '#F59E0B' }]} numberOfLines={1}>
                      {rec.recommendationReason}
                    </Text>
                  </View>

                  <Text style={[styles.recTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {rec.title}
                  </Text>
                  <Text style={[styles.recAuthor, { color: colors.textSecondary }]}>
                    {rec.author}
                  </Text>
                </View>
              </View>

              <Text style={[styles.recSummary, { color: colors.textSecondary }]} numberOfLines={2}>
                {rec.summary}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  if (isOwned && ownedBook) {
                    onOpenBook(ownedBook.id);
                  } else {
                    onDownload(rec.title, rec.author, rec.downloadUrl, rec.coverUrl);
                  }
                }}
                disabled={isDownloading}
                style={[
                  styles.primaryActionBtn,
                  {
                    backgroundColor: isOwned ? colors.canvas : colors.accent,
                    borderColor: isOwned ? colors.border : colors.accent,
                    borderWidth: isOwned ? 1 : 0,
                  },
                ]}
                activeOpacity={0.85}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color={colors.isDark ? '#000000' : '#FFFFFF'} />
                ) : isOwned ? (
                  <View style={styles.btnInnerRow}>
                    <CheckCircle2 size={13} color="#10B981" style={{ marginRight: 5 }} />
                    <Text style={[styles.primaryActionBtnText, { color: colors.textPrimary }]}>
                      In Library · Read
                    </Text>
                  </View>
                ) : (
                  <View style={styles.btnInnerRow}>
                    <Download
                      size={13}
                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.primaryActionBtnText,
                        { color: colors.isDark ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      Get Free EPUB
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    marginRight: 2,
  },
  recGrid: {
    gap: 12,
  },
  recCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  recCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recCover: {
    width: 44,
    height: 66,
    borderRadius: 6,
  },
  recCoverFallback: {
    width: 44,
    height: 66,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recDetails: {
    marginLeft: 12,
    flex: 1,
  },
  recReasonBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  recReasonText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 15,
    letterSpacing: -0.3,
  },
  recAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2,
  },
  recSummary: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  primaryActionBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
});
