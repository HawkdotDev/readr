import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { runWhenIdle } from '../../src/utils/idle';
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  BookOfTheDayCard,
  AuthorOfTheDayCard,
  LibraryAuthorsSection,
} from '../../src/components/home';
import {
  FocusSprintCard,
  ReflectionJournalCard,
  OpeningSentenceCard,
  ReadingMoodMatcherCard,
  LiteraryPollCard,
} from '../../src/components/feed';
import { useLibrary } from '../../src/hooks/useLibrary';
import {
  getRecentHighlightsWithBooks,
  EnrichedHighlight,
} from '../../src/db/queries/books';
import { getTodayReadingActivity, logReadingSession } from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import {
  getTodayOpeningSentence,
  getRandomOpeningSentence,
  OpeningSentenceItem,
} from '../../src/services/editorial/openingLinesService';
import {
  downloadOPDSBook,
} from '../../src/services/opds/opdsService';
import { ReadingGoal, OPDSBookEntry } from '../../src/types';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';

// ─── Filter Categories ─────────────────────────────────────────────────
export type FeedCategory =
  | 'all'
  | 'sprint'
  | 'reflection'
  | 'firstLines'
  | 'moods'
  | 'poll'
  | 'spotlights';

const FEED_FILTERS: { key: FeedCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'sprint', label: '⚡ Sprints' },
  { key: 'reflection', label: '📝 Reflection' },
  { key: 'firstLines', label: 'First Lines' },
  { key: 'moods', label: 'Vibes' },
  { key: 'poll', label: 'Debate' },
  { key: 'spotlights', label: 'Spotlights' },
];

export default function FeedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { books, loadBooks } = useLibrary();

  // Dynamic filter and loading state
  const [activeCategory, setActiveCategory] = useState<FeedCategory>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // User Stats & Goals State
  const [todayActivity, setTodayActivity] = useState<{ minutesRead: number; pagesRead: number }>({
    minutesRead: 0,
    pagesRead: 0,
  });
  const [goals, setGoals] = useState<ReadingGoal>({
    id: 'default_user',
    targetDailyMinutes: 30,
    targetDailyPages: 20,
    currentStreakDays: 0,
    longestStreakDays: 0,
  });
  const [highlights, setHighlights] = useState<EnrichedHighlight[]>([]);

  // Editorial Dynamic States
  const [openingSentence, setOpeningSentence] = useState<OpeningSentenceItem>(() => getTodayOpeningSentence());

  // ─── Data Loading ───────────────────────────────────────────────────
  const loadDynamicData = useCallback(async () => {
    try {
      const [g, act, hls] = await Promise.all([
        getReadingGoals(),
        getTodayReadingActivity(),
        getRecentHighlightsWithBooks(8),
      ]);
      setGoals(g);
      setTodayActivity(act);
      setHighlights(hls);
      await loadBooks();
    } catch (e) {
      console.warn('Failed to load feed dynamic state:', e);
    }
  }, [loadBooks]);

  useFocusEffect(
    useCallback(() => {
      const task = runWhenIdle(() => {
        loadDynamicData();
      });
      return () => task.cancel();
    }, [loadDynamicData])
  );

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    setOpeningSentence(getRandomOpeningSentence(openingSentence.id));
    await loadDynamicData();
    setRefreshing(false);
  };

  // Active reading book
  const activeReadingBook = useMemo(() => {
    const readingList = books.filter(
      (b) => b.status === 'reading' || ((b.progressPercentage ?? 0) > 0 && (b.progressPercentage ?? 0) < 100)
    );
    if (readingList.length > 0) {
      return readingList.sort(
        (a, b) => (b.lastReadAt?.getTime() || 0) - (a.lastReadAt?.getTime() || 0)
      )[0];
    }
    return books[0] || null;
  }, [books]);


  // Handlers
  const handleSprintComplete = useCallback((minutes: number) => {
    setTodayActivity((prev) => ({
      ...prev,
      minutesRead: prev.minutesRead + minutes,
    }));
  }, []);



  const handleDownloadBook = async (title: string, author: string, downloadUrl: string, coverUrl?: string) => {
    const existing = books.find(
      (b) => b.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
    if (existing) {
      router.push(`/reader/${existing.id}` as any);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setDownloadingId(title);
      const entry: OPDSBookEntry = {
        id: `opds_${Date.now()}`,
        title,
        author,
        summary: title,
        coverUrl,
        downloadUrl,
        fileFormat: 'epub',
      };
      const res = await downloadOPDSBook(entry);
      if (res.success && res.bookId) {
        await loadBooks();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.push(`/reader/${res.bookId}` as any);
      } else if (res.isDuplicate && res.bookId) {
        router.push(`/reader/${res.bookId}` as any);
      } else if (res.error) {
        Alert.alert('Notice', res.error);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to download book.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAuthorPress = (authorName: string) => {
    const hasBook = books.some((b) =>
      b.authors?.some((a) => a.name.toLowerCase().includes(authorName.toLowerCase()))
    );
    if (hasBook) {
      router.push(`/library?search=${encodeURIComponent(authorName)}` as any);
    } else {
      router.push(`/explore?search=${encodeURIComponent(authorName)}` as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Feed</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Daily Literary Insights
        </Text>
      </View>

      {/* Quick Filter Horizontal Chips */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FEED_FILTERS.map((filter) => {
            const isSelected = activeCategory === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveCategory(filter.key);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary,
                      fontWeight: isSelected ? '600' : '500',
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Feed Content Stream */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* 1. FOCUS READING SPRINT WIDGET */}
        {(activeCategory === 'all' || activeCategory === 'sprint') && (
          <FocusSprintCard
            activeBook={activeReadingBook}
            onSprintComplete={handleSprintComplete}
            onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
            onExplorePress={() => router.push('/explore')}
          />
        )}



        {/* 5. DAILY LITERARY REFLECTION & MEMORY RECALL */}
        {(activeCategory === 'all' || activeCategory === 'reflection') && (
          <ReflectionJournalCard
            activeBook={activeReadingBook}
            highlights={highlights}
            onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
          />
        )}

        {/* 6. ICONIC OPENING SENTENCE SHOWCASE */}
        {(activeCategory === 'all' || activeCategory === 'firstLines') && (
          <OpeningSentenceCard
            openingSentence={openingSentence}
            onShuffle={() => setOpeningSentence(getRandomOpeningSentence(openingSentence.id))}
          />
        )}



        {/* 9. LITERARY MOOD MATCHER */}
        {(activeCategory === 'all' || activeCategory === 'moods') && (
          <ReadingMoodMatcherCard
            books={books}
            downloadingId={downloadingId}
            onDownloadBook={handleDownloadBook}
            onOpenBook={(bookId) => router.push(`/reader/${bookId}` as any)}
          />
        )}





        {/* 13. DAILY LITERARY POLL & DEBATE */}
        {(activeCategory === 'all' || activeCategory === 'poll') && (
          <LiteraryPollCard />
        )}

        {/* 14. EDITORIAL SPOTLIGHTS (BOOK & AUTHOR OF THE DAY) */}
        {(activeCategory === 'all' || activeCategory === 'spotlights') && (
          <>
            <View style={styles.sectionBlock}>
              <BookOfTheDayCard />
            </View>

            <View style={styles.sectionBlock}>
              <AuthorOfTheDayCard />
            </View>

            <View style={styles.sectionBlock}>
              <LibraryAuthorsSection
                books={books}
                onAuthorPress={handleAuthorPress}
                onSeeAllPress={() => router.push('/explore')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.mona.medium,
  },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  sectionBlock: {
    marginBottom: 24,
  },
});
