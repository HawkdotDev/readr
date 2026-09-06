import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Book } from '../../types';
import { FONTS } from '../../utils/typography';
import {
  calculateReadingVelocity,
  DEFAULT_WPM,
} from '../../services/editorial/readingVelocityService';
import { Timer, Clock, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface BookFinishDatePredictorProps {
  book: Book;
  dailyGoalMinutes?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const BookFinishDatePredictor: React.FC<BookFinishDatePredictorProps> = ({
  book,
  dailyGoalMinutes = 30,
  containerStyle,
}) => {
  const { colors } = useTheme();
  const [selectedPace, setSelectedPace] = useState<number>(dailyGoalMinutes || 30);

  useEffect(() => {
    setSelectedPace(dailyGoalMinutes || 30);
  }, [book.id, dailyGoalMinutes]);

  const isCompleted =
    book.status === 'finished' ||
    (book.progressPercentage || 0) >= 100;

  const velocity = calculateReadingVelocity(book, DEFAULT_WPM, selectedPace);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header Eyebrow Row */}
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.accent}15`, borderColor: `${colors.accent}30` },
            ]}
          >
            <Timer size={13} color={colors.accent} />
          </View>
          <Text style={[styles.eyebrowText, { color: colors.textSecondary }]}>
            FINISH-DATE PREDICTOR
          </Text>
        </View>

        <View
          style={[
            styles.timeBadge,
            {
              backgroundColor: isCompleted
                ? (colors.isMonochrome ? '#27272A' : '#10B98118')
                : colors.surface,
              borderColor: isCompleted
                ? (colors.isMonochrome ? '#52525B' : '#10B98140')
                : colors.border,
            },
          ]}
        >
          {isCompleted ? (
            <CheckCircle2
              size={12}
              color={colors.isMonochrome ? colors.textPrimary : '#10B981'}
              style={{ marginRight: 4 }}
            />
          ) : (
            <Clock size={11} color={colors.accent} style={{ marginRight: 4 }} />
          )}
          <Text
            style={[
              styles.timeBadgeText,
              {
                color: isCompleted
                  ? (colors.isMonochrome ? colors.textPrimary : '#10B981')
                  : colors.accent,
              },
            ]}
          >
            {velocity.formattedTimeRemaining}
          </Text>
        </View>
      </View>

      {/* Main Card Body */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {isCompleted ? (
          <View style={styles.completedBox}>
            <CheckCircle2
              size={28}
              color={colors.isMonochrome ? colors.textPrimary : '#10B981'}
              style={{ marginBottom: 6 }}
            />
            <Text style={[styles.completedTitle, { color: colors.textPrimary }]}>
              Book Completed!
            </Text>
            <Text style={[styles.completedSubtext, { color: colors.textSecondary }]}>
              You have finished this title. Great achievement!
            </Text>
          </View>
        ) : (
          <>
            {/* Primary Forecast Hero Banner */}
            <View
              style={[
                styles.forecastBanner,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
                ESTIMATED FINISH DATE
              </Text>
              <Text style={[styles.forecastDate, { color: colors.textPrimary }]}>
                {velocity.primaryForecast.formattedDate}
              </Text>
              <Text style={[styles.forecastSummary, { color: colors.accent }]}>
                {velocity.primaryForecast.summary}
              </Text>
            </View>

            {/* Velocity Metrics 3-Item Grid */}
            <View style={styles.metricsGrid}>
              <View
                style={[
                  styles.metricItem,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
                  {velocity.wpm}
                </Text>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
                  Words / Min
                </Text>
              </View>

              <View
                style={[
                  styles.metricItem,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
                  ~{velocity.pagesPerHour}
                </Text>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
                  Pages / Hour
                </Text>
              </View>

              <View
                style={[
                  styles.metricItem,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
                  {velocity.primaryForecast.daysRemaining}d
                </Text>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
                  Days at Pace
                </Text>
              </View>
            </View>

            {/* Pace Simulator Chips */}
            <View style={[styles.paceSection, { borderTopColor: colors.border }]}>
              <View style={styles.paceLabelRow}>
                <TrendingUp size={12} color={colors.textSecondary} style={{ marginRight: 5 }} />
                <Text style={[styles.paceLabel, { color: colors.textSecondary }]}>
                  PACE SIMULATOR
                </Text>
              </View>

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
                      activeOpacity={0.7}
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
                            fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  eyebrowText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  forecastBanner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  forecastDate: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  forecastSummary: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  metricNumber: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 15,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  metricTitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10,
  },
  paceSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  paceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paceLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  paceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paceChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  paceChipText: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
  completedBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  completedTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  completedSubtext: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});
