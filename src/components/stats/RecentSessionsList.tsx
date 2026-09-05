import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OptimizedImage } from '../common/OptimizedImage';
import { GenerativeEditorialCover } from '../common/GenerativeEditorialCover';
import { useTheme } from '../common/ThemeProvider';
import { EnrichedReadingSession } from '../../db/queries/stats';
import { formatDurationSeconds, formatRelativeDate } from '../../utils/time';
import { BookOpen, Zap, FileText, ChevronRight, Clock } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface RecentSessionsListProps {
  sessions: EnrichedReadingSession[];
  onSessionPress?: (session: EnrichedReadingSession) => void;
  onExplorePress?: () => void;
}

export function RecentSessionsList({
  sessions,
  onSessionPress,
  onExplorePress,
}: RecentSessionsListProps) {
  const { colors } = useTheme();

  if (sessions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <BookOpen size={24} color={colors.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Sessions Recorded Yet</Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          Read any book in your library and your time, speed, and pages will be recorded here automatically.
        </Text>
        {onExplorePress && (
          <TouchableOpacity
            onPress={onExplorePress}
            style={[styles.emptyBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Open Library"
          >
            <Text style={[styles.emptyBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
              Start Reading
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sessions.map((sess) => (
        <TouchableOpacity
          key={sess.id}
          activeOpacity={0.7}
          onPress={() => {
            if (onSessionPress) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onSessionPress(sess);
            }
          }}
          style={[
            styles.sessionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessible={true}
          accessibilityLabel={`Session: ${sess.bookTitle}, ${formatDurationSeconds(sess.durationSeconds)}`}
        >
          {/* Left: Book Cover or Fallback */}
          <View style={[styles.coverWrapper, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
            {sess.coverImagePath ? (
              <OptimizedImage source={{ uri: sess.coverImagePath }} style={styles.coverImage} contentFit="cover" />
            ) : (
              <GenerativeEditorialCover title={sess.bookTitle} author={sess.bookAuthor} isCompact={true} />
            )}
          </View>

          {/* Center: Book & Session Details */}
          <View style={styles.cardCenter}>
            <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {sess.bookTitle}
            </Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {sess.bookAuthor}
            </Text>

            {/* Badges Row */}
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.metricPill,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Zap size={11} color={colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.metricPillText, { color: colors.textPrimary }]}>
                  {formatDurationSeconds(sess.durationSeconds)}
                </Text>
              </View>

              {sess.pagesRead > 0 && (
                <View
                  style={[
                    styles.metricPill,
                    { backgroundColor: colors.canvas, borderColor: colors.border },
                  ]}
                >
                  <FileText size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.metricPillText, { color: colors.textSecondary }]}>
                    {sess.pagesRead} {sess.pagesRead === 1 ? 'pg' : 'pgs'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right: Time Ago & Chevron */}
          <View style={styles.cardRight}>
            <Text style={[styles.relativeDate, { color: colors.textSecondary }]}>
              {formatRelativeDate(sess.startTime)}
            </Text>
            <ChevronRight size={16} color={colors.textSecondary} style={{ marginTop: 8 }} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default RecentSessionsList;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coverWrapper: {
    width: 44,
    height: 62,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  metricPillText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: -0.1,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
    height: 54,
  },
  relativeDate: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    maxWidth: 280,
  },
  emptyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
});
