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
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  BookOfTheDayCard,
  AuthorOfTheDayCard,
  ArtistsSection,
} from '../../src/components/home';
import {
  ReadingMomentumCard,
  FocusSprintCard,
  ReadingChallengeCard,
  VelocityPredictorCard,
  ReflectionJournalCard,
  OpeningSentenceCard,
  WordOfTheDayCard,
  LiteraryLoreCard,
  ReadingMoodMatcherCard,
  SavedClippingsCard,
  ThisDayInLiteratureCard,
  LiteraryPollCard,
  PersonalizedRecommendationsCard,
} from '../../src/components/feed';
import { useLibrary } from '../../src/hooks/useLibrary';
import {
  getRecentHighlightsWithBooks,
  EnrichedHighlight,
} from '../../src/db/queries/books';
import { getTodayReadingActivity } from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import {
  getPersonalizedRecommendations,
} from '../../src/services/recommendations/recommendationService';
import {
  getTodayInLiterature,
  getRandomAlmanacEvent,
  LiteraryAlmanacEvent,
} from '../../src/services/editorial/literaryAlmanacService';
import {
  getWordOfTheDay,
  getRandomLiteraryWord,
  LiteraryWord,
} from '../../src/services/editorial/literaryLexiconService';
import {
  getTodayOpeningSentence,
  getRandomOpeningSentence,
  OpeningSentenceItem,
} from '../../src/services/editorial/openingLinesService';
import {
  getTodayLiteraryLore,
  getRandomLiteraryLore,
  LiteraryLoreItem,
} from '../../src/services/editorial/literaryLoreService';
import {
  downloadOPDSBook,
} from '../../src/services/opds/opdsService';
import { ReadingGoal, OPDSBookEntry } from '../../src/types';
import {
  Rss,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';

// ─── Filter Categories ─────────────────────────────────────────────────
export type FeedCategory =
  | 'all'
  | 'pulse'
  | 'sprint'
  | 'challenge'
  | 'velocity'
  | 'reflection'
  | 'firstLines'
  | 'wordOfDay'
  | 'lore'
  | 'moods'
  | 'clippings'
  | 'almanac'
  | 'recommendations'
  | 'poll'
  | 'spotlights';

const FEED_FILTERS: { key: FeedCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pulse', label: 'Pulse' },
  { key: 'sprint', label: '⚡ Sprints' },
  { key: 'challenge', label: '🎯 Challenge' },
  { key: 'velocity', label: '⏱️ Velocity' },
  { key: 'reflection', label: '📝 Reflection' },
  { key: 'firstLines', label: 'First Lines' },
  { key: 'wordOfDay', label: 'Lexicon' },
  { key: 'lore', label: '60s Lore' },
  { key: 'moods', label: 'Vibes' },
  { key: 'clippings', label: 'Clippings' },
  { key: 'almanac', label: 'Almanac' },
  { key: 'recommendations', label: 'For You' },
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
  const [literaryWord, setLiteraryWord] = useState<LiteraryWord>(() => getWordOfTheDay());
  const [literaryLore, setLiteraryLore] = useState<LiteraryLoreItem>(() => getTodayLiteraryLore());
  const [almanacEvent, setAlmanacEvent] = useState<LiteraryAlmanacEvent>(() => getTodayInLiterature());
  const [annualChallengeTarget, setAnnualChallengeTarget] = useState<number>(24);

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
      loadDynamicData();
    }, [loadDynamicData])
  );

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    setAlmanacEvent(getRandomAlmanacEvent(almanacEvent.id));
    setOpeningSentence(getRandomOpeningSentence(openingSentence.id));
    setLiteraryWord(getRandomLiteraryWord(literaryWord.id));
    setLiteraryLore(getRandomLiteraryLore(literaryLore.id));
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

  // Personalized recommendations
  const personalizedRecs = useMemo(() => {
    return getPersonalizedRecommendations(books).slice(0, 4);
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

  const handleArtistPress = (artistName: string) => {
    const hasBook = books.some((b) =>
      b.authors?.some((a) => a.name.toLowerCase().includes(artistName.toLowerCase()))
    );
    if (hasBook) {
      router.push(`/library?search=${encodeURIComponent(artistName)}` as any);
    } else {
      router.push(`/explore?search=${encodeURIComponent(artistName)}` as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Feed</Text>
            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: colors.isDark
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(16, 185, 129, 0.1)',
                },
              ]}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>DISPATCH</Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Daily Literary Insights & Tools
          </Text>
        </View>

        <View style={styles.headerRightStats}>
          <View
            style={[
              styles.streakPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Flame size={15} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={[styles.streakPillText, { color: colors.textPrimary }]}>
              {goals.currentStreakDays}d
            </Text>
          </View>
        </View>
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
        {/* 1. DYNAMIC READING MOMENTUM */}
        {(activeCategory === 'all' || activeCategory === 'pulse') && (
          <ReadingMomentumCard
            todayMinutes={todayActivity.minutesRead}
            targetMinutes={goals.targetDailyMinutes}
            todayPages={todayActivity.pagesRead}
            currentStreakDays={goals.currentStreakDays}
            activeBook={activeReadingBook}
            onResumePress={(bookId) => router.push(`/reader/${bookId}` as any)}
            onExplorePress={() => router.push('/explore')}
          />
        )}

        {/* 2. FOCUS READING SPRINT WIDGET */}
        {(activeCategory === 'all' || activeCategory === 'sprint') && (
          <FocusSprintCard
            activeBook={activeReadingBook}
            onSprintComplete={handleSprintComplete}
            onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
            onExplorePress={() => router.push('/explore')}
          />
        )}

        {/* 3. 2026 READING CHALLENGE TRACKER */}
        {(activeCategory === 'all' || activeCategory === 'challenge') && (
          <ReadingChallengeCard
            books={books}
            targetAnnualBooks={annualChallengeTarget}
            onTargetChange={setAnnualChallengeTarget}
            onBookPress={(bookId) => router.push(`/reader/${bookId}` as any)}
          />
        )}

        {/* 4. FINISH-DATE & READING PACE VELOCITY PREDICTOR */}
        {(activeCategory === 'all' || activeCategory === 'velocity') && (
          <VelocityPredictorCard
            activeBook={activeReadingBook}
            dailyGoalMinutes={goals.targetDailyMinutes || 30}
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

        {/* 7. LITERARY LEXICON (WORD OF THE DAY) */}
        {(activeCategory === 'all' || activeCategory === 'wordOfDay') && (
          <WordOfTheDayCard
            literaryWord={literaryWord}
            onShuffle={() => setLiteraryWord(getRandomLiteraryWord(literaryWord.id))}
          />
        )}

        {/* 8. LITERARY LORE (MICRO-ESSAY) */}
        {(activeCategory === 'all' || activeCategory === 'lore') && (
          <LiteraryLoreCard
            literaryLore={literaryLore}
            onShuffle={() => setLiteraryLore(getRandomLiteraryLore(literaryLore.id))}
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

        {/* 10. SAVED CLIPPINGS & HIGHLIGHTS */}
        {(activeCategory === 'all' || activeCategory === 'clippings') && (
          <SavedClippingsCard
            highlights={highlights}
            onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
            onExplorePress={() => router.push('/explore')}
          />
        )}

        {/* 11. THIS DAY IN LITERATURE (ALMANAC) */}
        {(activeCategory === 'all' || activeCategory === 'almanac') && (
          <ThisDayInLiteratureCard
            almanacEvent={almanacEvent}
            onShuffle={() => setAlmanacEvent(getRandomAlmanacEvent(almanacEvent.id))}
          />
        )}

        {/* 12. PERSONALIZED RECOMMENDATIONS */}
        {(activeCategory === 'all' || activeCategory === 'recommendations') && (
          <PersonalizedRecommendationsCard
            recommendations={personalizedRecs}
            books={books}
            downloadingId={downloadingId}
            onDownload={handleDownloadBook}
            onOpenBook={(bookId) => router.push(`/reader/${bookId}` as any)}
            onSeeAllPress={() => router.push('/explore')}
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
              <ArtistsSection
                books={books}
                onArtistPress={handleArtistPress}
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
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontFamily: FONTS.mono.bold,
    color: '#10B981',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.mona.regular,
    marginTop: 2,
  },
  headerRightStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  streakPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
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
