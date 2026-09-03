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
import { useTheme } from '../../src/components/common/ThemeProvider';
import {
  ContinueReadingCard,
  ContinueStartedSection,
  YouMightLikeSection,
  GenresSection,
  SpotlightBookCard,
  SpotlightAuthorCard,
} from '../../src/components/home';
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
import { Flame, BookOpen, Rss, Server, Globe, ChevronRight, Compass } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';
import {
  getActivityHistory,
  DayActivity,
} from '../../src/db/queries/stats';
import { getReadingGoals } from '../../src/db/queries/settings';
import { DEFAULT_OPDS_SERVERS } from '../../src/db/queries/opds';

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
  const [feedMode, setFeedMode] = useState<'feed' | 'server'>('feed');

  // Reading Stats State
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [goals, setGoals] = useState<ReadingGoal>({
    id: 'default_user',
    targetDailyMinutes: 30,
    targetDailyPages: 20,
    currentStreakDays: 0,
    longestStreakDays: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const [act, g] = await Promise.all([
        getActivityHistory(112),
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
      loadBooks();
      loadStats();
    }, [loadBooks, loadStats])
  );

  const handleRefresh = async () => {
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


  const handleGenrePress = (genreName: string) => {
    const hasBookInLibrary = books.some(
      (b) =>
        b.tags?.some((t) => t.name.toLowerCase().includes(genreName.toLowerCase())) ||
        b.description?.toLowerCase().includes(genreName.toLowerCase()) ||
        b.title.toLowerCase().includes(genreName.toLowerCase())
    );
    if (hasBookInLibrary) {
      useLibraryStore.getState().setSearchQuery(genreName);
      router.push('/library');
    } else {
      router.push('/explore');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header — matches Settings/Stats design language */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Readr</Text>

        <View style={styles.headerActions}>
          {/* Feed / Server Mode Toggle */}
          <View
            style={[
              styles.feedServerToggle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setFeedMode('feed');
              }}
              style={[
                styles.toggleSegment,
                feedMode === 'feed' && [
                  styles.toggleSegmentActive,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ],
              ]}
              accessible={true}
              accessibilityLabel="Editorial Feed"
            >
              <Rss
                size={15}
                color={
                  feedMode === 'feed'
                    ? colors.accent
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setFeedMode('server');
              }}
              style={[
                styles.toggleSegment,
                feedMode === 'server' && [
                  styles.toggleSegmentActive,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ],
              ]}
              accessible={true}
              accessibilityLabel="OPDS Servers"
            >
              <Server
                size={15}
                color={
                  feedMode === 'server'
                    ? colors.accent
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.streakPill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Flame size={15} color="#F59E0B" style={{ marginRight: 4 }} />
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
        {feedMode === 'server' ? (
          <View style={styles.serverSection}>
            <View style={styles.serverHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Server size={17} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={[styles.serverSectionTitle, { color: colors.textPrimary }]}>
                  Connected OPDS Feeds
                </Text>
              </View>
              <Text style={[styles.serverSectionSub, { color: colors.textSecondary }]}>
                Public Domain
              </Text>
            </View>

            {DEFAULT_OPDS_SERVERS.map((server) => (
              <TouchableOpacity
                key={server.id}
                activeOpacity={0.88}
                onPress={() => router.push('/explore')}
                style={[
                  styles.serverCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.serverIconBox,
                    { backgroundColor: colors.canvas, borderColor: colors.border },
                  ]}
                >
                  <Globe size={18} color={colors.accent} />
                </View>
                <View style={styles.serverCardContent}>
                  <Text style={[styles.serverCardTitle, { color: colors.textPrimary }]}>
                    {server.title}
                  </Text>
                  <Text
                    style={[styles.serverCardUrl, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {server.url}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/explore')}
              style={[
                styles.browseAllBtn,
                { backgroundColor: colors.accent },
              ]}
            >
              <Compass
                size={16}
                color={colors.isDark ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.browseAllBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Browse Full Catalog in Explore
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Pick Up Where You Left Off Hero Card */}
            {featuredBook && (
              <View style={styles.heroSection}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  CONTINUE READING
                </Text>
                <ContinueReadingCard
                  book={featuredBook}
                  onPress={() => router.push(`/reader/${featuredBook.id}` as any)}
                  onLongPress={() => setSelectedWheelBook(featuredBook)}
                  onOptionsPress={() => setSelectedWheelBook(featuredBook)}
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

            {/* Contemporary Editorial Spotlights: Spotlight Book & Spotlight Author */}
            <SpotlightBookCard />
            <SpotlightAuthorCard />

            {/* You Might Like Side-Scrolling Section */}
            <YouMightLikeSection
              existingBooks={books}
              onBookPress={handleRecommendedBookPress}
              loadingBookId={loadingRecId}
            />

            {/* Genres Section */}
            <GenresSection
              onGenrePress={handleGenrePress}
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
          </>
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
  feedServerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  toggleSegment: {
    width: 32,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleSegmentActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  heroSection: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  serverSection: {
    paddingTop: 8,
  },
  serverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  serverSectionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  serverSectionSub: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serverIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serverCardContent: {
    flex: 1,
    marginRight: 8,
  },
  serverCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  serverCardUrl: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
  browseAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  browseAllBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
});
