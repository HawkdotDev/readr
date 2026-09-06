import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { runWhenIdle } from '../../src/utils/idle';
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  ContinueStartedSection,
  YouMightLikeSection,
  SpotlightBookCard,
  SpotlightAuthorCard,
  ThisDayInLiteratureCard,
  WordOfTheDayCard,
  LiteraryLoreCard,
} from '../../src/components/home';
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
  getTodayLiteraryLore,
  getRandomLiteraryLore,
  LiteraryLoreItem,
} from '../../src/services/editorial/literaryLoreService';
import { ReadingMomentumCard } from '../../src/components/feed/ReadingMomentumCard';
import {
  RadialOptionsMenu,
  EmptyLibrary,
} from '../../src/components/library';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { useLibrary } from '../../src/hooks/useLibrary';
import { useLibraryStore } from '../../src/store/libraryStore';
import {
  downloadRecommendedBook,
  RecommendedBook,
} from '../../src/services/recommendations/recommendationService';
import { updateBookStatus, deleteBook } from '../../src/db/queries/books';
import { Book, ReadingGoal } from '../../src/types';
import { Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';
import {
  getActivityHistory,
  DayActivity,
} from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    books,
    featuredBook,
    inProgressBooks,
    refreshing,
    toggleFavorite,
    updateRating,
    loadBooks,
    onRefresh,
  } = useLibrary();

  const [selectedWheelBook, setSelectedWheelBook] = useState<Book | null>(null);
  const [loadingRecId, setLoadingRecId] = useState<string | null>(null);

  // Reading Stats State
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [goals, setGoals] = useState<ReadingGoal>({
    id: 'default_user',
    targetDailyMinutes: 30,
    targetDailyPages: 20,
    currentStreakDays: 0,
    longestStreakDays: 0,
  });

  // Literary Almanac State (This Day in Literature)
  const [almanacEvent, setAlmanacEvent] = useState<LiteraryAlmanacEvent>(() => getTodayInLiterature());
  // Word of the Day State (Daily Lexicon)
  const [literaryWord, setLiteraryWord] = useState<LiteraryWord>(() => getWordOfTheDay());
  // Literary Lore State (Micro-Essay)
  const [literaryLore, setLiteraryLore] = useState<LiteraryLoreItem>(() => getTodayLiteraryLore());

  const loadStats = useCallback(async () => {
    try {
      const [act, g] = await Promise.all([
        getActivityHistory(14),
        getReadingGoals(),
      ]);
      setActivity(act);
      setGoals(g);
    } catch (e) {
      console.warn('Failed to load stats in HomeScreen:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const task = runWhenIdle(() => {
        loadBooks();
        loadStats();
      });
      return () => task.cancel();
    }, [loadBooks, loadStats])
  );

  const handleRefresh = async () => {
    setAlmanacEvent(getRandomAlmanacEvent(almanacEvent.id));
    setLiteraryWord(getRandomLiteraryWord(literaryWord.id));
    setLiteraryLore(getRandomLiteraryLore(literaryLore.id));
    await Promise.all([onRefresh(), loadStats()]);
  };

  // Calculate today's reading metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAct = activity.find((a) => a.date === todayStr);
  const todayMinutes = todayAct ? todayAct.minutesRead : 0;
  const todayPages = todayAct ? todayAct.pagesRead : 0;
  const todaySessions = todayAct ? todayAct.count : 0;

  const handleRecommendedBookPress = async (rec: RecommendedBook) => {
    // Check if the user already has this book
    const existing = books.find(
      (b) => b.title.toLowerCase().trim() === rec.title.toLowerCase().trim()
    );
    if (existing) {
      router.push(`/reader/${existing.id}` as any);
      return;
    }

    try {
      setLoadingRecId(rec.id);
      const res = await downloadRecommendedBook(rec);
      if (res.success && res.bookId) {
        await Promise.all([loadBooks(), loadStats()]);
        router.push(`/reader/${res.bookId}` as any);
      } else if (res.isDuplicate && res.bookId) {
        router.push(`/reader/${res.bookId}` as any);
      } else if (res.error) {
        Alert.alert('Download notice', res.error);
      }
    } catch (err: any) {
      Alert.alert('Notice', err?.message || 'Failed to download recommendation.');
    } finally {
      setLoadingRecId(null);
    }
  };

  const handleImport = async () => {
    const res = await pickAndImportBook();
    if (!res) return;

    if (res.isDuplicate && res.bookId) {
      Alert.alert(
        'Book Already in Library',
        'This book has already been imported. Would you like to read it now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Book', onPress: () => router.push(`/reader/${res.bookId}` as any) },
        ]
      );
      return;
    }

    if (res.success && res.bookId) {
      await Promise.all([loadBooks(), loadStats()]);
      router.push(`/reader/${res.bookId}` as any);
    } else if (res.error) {
      Alert.alert('Import Notice', res.error);
    }
  };




  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header — matches Settings/Stats design language */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Readr</Text>

        <View style={styles.headerActions}>
          <View
            style={[
              styles.streakPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Flame size={15} color={colors.isMonochrome ? colors.textPrimary : '#F59E0B'} style={{ marginRight: 4 }} />
            <Text style={[styles.streakPillText, { color: colors.textPrimary }]}>
              {goals.currentStreakDays}d streak
            </Text>
          </View>
        </View>
      </View>

      {/* Main Scroll Container */}
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
        {/* Pick Up Where You Left Off Hero Card */}
        {featuredBook && (
          <View style={styles.heroSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              CONTINUE READING
            </Text>
            <ReadingMomentumCard
              todayMinutes={todayMinutes}
              targetMinutes={goals.targetDailyMinutes}
              todayPages={todayPages}
              currentStreakDays={goals.currentStreakDays}
              activeBook={featuredBook}
              onResumePress={(bookId) => router.push(`/reader/${bookId}` as any)}
              onExplorePress={() => router.push('/explore')}
            />
          </View>
        )}

            {/* Continue Books You Started Section */}
            {inProgressBooks.length > 0 && (
              <ContinueStartedSection
                books={inProgressBooks}
                onBookPress={(b) => router.push(`/reader/${b.id}` as any)}
                onBookLongPress={(b) => setSelectedWheelBook(b)}
              />
            )}

            {/* This Day in Literature (Daily Literary Almanac) */}
            <ThisDayInLiteratureCard
              almanacEvent={almanacEvent}
              onShuffle={() => setAlmanacEvent(getRandomAlmanacEvent(almanacEvent.id))}
            />

            {/* Word of the Day (Daily Lexicon) */}
            <WordOfTheDayCard
              literaryWord={literaryWord}
              onShuffle={() => setLiteraryWord(getRandomLiteraryWord(literaryWord.id))}
            />

            {/* Literary Lore (Daily Micro-Story) */}
            <LiteraryLoreCard
              literaryLore={literaryLore}
              onShuffle={() => setLiteraryLore(getRandomLiteraryLore(literaryLore.id))}
            />

            {/* Contemporary Editorial Spotlights: Spotlight Book & Spotlight Author */}
            <SpotlightBookCard />
            <SpotlightAuthorCard />

            {/* You Might Like Side-Scrolling Section */}
            <YouMightLikeSection
              existingBooks={books}
              onBookPress={handleRecommendedBookPress}
              loadingBookId={loadingRecId}
            />



            {/* Empty State Prompt if no books in library */}
            {books.length === 0 && (
              <EmptyLibrary
                onImportPress={handleImport}
                onExplorePress={() => router.push('/explore')}
              />
            )}
      </ScrollView>

      {/* Popover Options Menu with 5-Star Rating */}
      <RadialOptionsMenu
        visible={Boolean(selectedWheelBook)}
        book={selectedWheelBook}
        onClose={() => setSelectedWheelBook(null)}
        onOpenReader={(b) => {
          setSelectedWheelBook(null);
          router.push(`/reader/${b.id}` as any);
        }}
        onOpenDetails={(b) => {
          setSelectedWheelBook(null);
          router.push(`/book/${b.id}` as any);
        }}
        onToggleFavorite={async (b) => {
          setSelectedWheelBook(null);
          await toggleFavorite(b.id);
        }}
        onToggleStatus={async (b) => {
          const nextStatus = b.status === 'finished' ? 'reading' : 'finished';
          await updateBookStatus(b.id, nextStatus);
          await Promise.all([loadBooks(), loadStats()]);
          setSelectedWheelBook(null);
        }}
        onUpdateRating={async (b, r) => {
          await updateRating(b.id, r);
        }}
        onDeleteBook={async (b) => {
          await deleteBook(b.id);
          await Promise.all([loadBooks(), loadStats()]);
          setSelectedWheelBook(null);
        }}
      />

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
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakPillText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    letterSpacing: -0.2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  heroSection: {
    marginBottom: 3,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});
