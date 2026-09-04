import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OptimizedImage } from '../common/OptimizedImage';
import { Book } from '../../types';
import { FONTS } from '../../utils/typography';
import {
  calculateReadingVelocity,
  DEFAULT_WPM,
} from '../../services/editorial/readingVelocityService';
import {
  Timer,
  Clock,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Play,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface VelocityPredictorCardProps {
  activeBook: Book | null;
  dailyGoalMinutes: number;
  onOpenReader: (bookId: string) => void;
  onExplorePress: () => void;
}

export const VelocityPredictorCard: React.FC<VelocityPredictorCardProps> = ({
  activeBook,
  dailyGoalMinutes,
  onOpenReader,
  onExplorePress,
}) => {
  const { colors } = useTheme();
  const [selectedPace, setSelectedPace] = useState<number>(dailyGoalMinutes || 30);

  if (!activeBook) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.eyebrowRow}>
            <Timer size={14} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
              FINISH-DATE PREDICTOR
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onExplorePress}
          style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <BookOpen size={24} color={colors.accent} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Book Currently In Progress
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Open a book to get personalized velocity metrics and accurate finish-date forecasts.
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const velocity = calculateReadingVelocity(activeBook, DEFAULT_WPM, selectedPace);

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <Timer size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
            FINISH-DATE PREDICTOR
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {velocity.formattedTimeRemaining}
          </Text>
        </View>
      </View>

      {/* Main Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Book Header Row */}
        <View style={styles.bookRow}>
          {activeBook.coverImagePath ? (
            <OptimizedImage
              source={{ uri: activeBook.coverImagePath }}
              style={styles.bookCover}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.bookCoverFallback,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <BookOpen size={16} color={colors.accent} />
            </View>
          )}

          <View style={styles.bookDetails}>
            <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeBook.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {activeBook.authors?.map((a) => a.name).join(', ') || 'Classic Literature'}
            </Text>
            <Text style={[styles.progressMeta, { color: colors.accent }]}>
              {Math.round(activeBook.progressPercentage || 0)}% complete · {velocity.remainingPages} pages left
            </Text>
          </View>
        </View>

        {/* Finish Date Hero Banner */}
        <View style={[styles.forecastBanner, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
            ESTIMATED FINISH
          </Text>
          <Text style={[styles.forecastDate, { color: colors.textPrimary }]}>
            {velocity.primaryForecast.formattedDate}
          </Text>
          <Text style={[styles.forecastSummary, { color: colors.accent }]}>
            {velocity.primaryForecast.summary}
          </Text>
        </View>

        {/* Velocity Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricItem, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              {velocity.wpm}
            </Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
              Words / Min
            </Text>
          </View>

          <View style={[styles.metricItem, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              ~{velocity.pagesPerHour}
            </Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
              Pages / Hour
            </Text>
          </View>

          <View style={[styles.metricItem, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              {velocity.primaryForecast.daysRemaining}d
            </Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
              Days at Pace
            </Text>
          </View>
        </View>

        {/* Pace Simulator Controls */}
        <View style={[styles.paceSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.paceLabel, { color: colors.textSecondary }]}>
            PACE SIMULATOR:
          </Text>
          <View style={styles.paceChips}>
            {velocity.forecasts.map((fc) => {
              const isSelected = selectedPace === fc.minutesPerDay;
              return (
                <TouchableOpacity
                  key={fc.minutesPerDay}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedPace(fc.minutesPerDay);
                  }}
                  style={[
                    styles.paceChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.canvas,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paceChipText,
                      {
                        color: isSelected
                          ? colors.isDark
                            ? '#000000'
                            : '#FFFFFF'
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {fc.minutesPerDay}m/d ({fc.formattedDate})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onOpenReader(activeBook.id);
          }}
          style={[styles.resumeBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Play
            size={13}
            color={colors.isDark ? '#000000' : '#FFFFFF'}
            fill={colors.isDark ? '#000000' : '#FFFFFF'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.resumeBtnText,
              { color: colors.isDark ? '#000000' : '#FFFFFF' },
            ]}
          >
            Pick Up Where You Left Off
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bookCover: {
    width: 38,
    height: 56,
    borderRadius: 4,
  },
  bookCoverFallback: {
    width: 38,
    height: 56,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2,
  },
  progressMeta: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
    marginTop: 4,
  },
  forecastBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  forecastDate: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 22,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  forecastSummary: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
  },
  metricTitle: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10,
    marginTop: 2,
  },
  paceSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 14,
  },
  paceLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  paceChips: {
    flexDirection: 'row',
    gap: 6,
  },
  paceChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  paceChipText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  resumeBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
