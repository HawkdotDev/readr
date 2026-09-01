import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { BookCard } from '../../src/components/library/BookCard';
import { FilterBar } from '../../src/components/library/FilterBar';
import { EmptyLibrary } from '../../src/components/library/EmptyLibrary';
import { SearchBar } from '../../src/components/common/SearchBar';
import { RadialOptionsMenu } from '../../src/components/library/RadialOptionsMenu';
import { YouMightLikeSection } from '../../src/components/library/YouMightLikeSection';
import { ContinueStartedSection } from '../../src/components/library/ContinueStartedSection';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { useLibrary } from '../../src/hooks/useLibrary';
import { downloadRecommendedBook, RecommendedBook } from '../../src/services/recommendations/recommendationService';
import { toggleBookFavorite, updateBookStatus, deleteBook } from '../../src/db/queries/books';
import { Book } from '../../src/types';
import { Plus, Search, LayoutGrid, List } from 'lucide-react-native';
import { ContinueReadingCard } from '../../src/components/library/ContinueReadingCard';
import { FONTS } from '../../src/utils/typography';

export default function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    books,
    filteredBooks,
    featuredBook,
    inProgressBooks,
    favoriteBooks,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    toggleFavorite,
    loadBooks,
    onRefresh,
  } = useLibrary();

  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const [selectedWheelBook, setSelectedWheelBook] = useState<Book | null>(null);
  const [loadingRecId, setLoadingRecId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

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
        await loadBooks();
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
      await loadBooks();
      router.push(`/reader/${res.bookId}` as any);
    } else if (res.error) {
      Alert.alert('Import Notice', res.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Home</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              setIsSearchOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setSearchQuery('');
                }
                return next;
              });
            }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isSearchOpen ? colors.surface : colors.canvas,
                borderColor: isSearchOpen ? colors.accent : colors.border,
              },
            ]}
            accessible={true}
            accessibilityLabel="Search Library"
          >
            <Search size={20} color={isSearchOpen ? colors.accent : colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            style={[styles.importBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Import Book"
          >
            <Plus size={20} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredBooks}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridColumnWrapper : undefined}
        keyExtractor={(item) => item.id}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        updateCellsBatchingPeriod={40}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {isSearchOpen && (
              <View style={styles.searchContainer}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search your library..."
                  autoFocus={true}
                />
              </View>
            )}

            {/* Pick Up Where You Left Off Section Header & Hero Card */}
            {featuredBook && !searchQuery.trim() && (
              <View style={styles.heroSection}>
                <Text style={[styles.heroSectionTitle, { color: colors.textSecondary }]}>
                  Pick up where you left off
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
            {!searchQuery.trim() && inProgressBooks.length > 0 && (
              <ContinueStartedSection
                books={inProgressBooks}
                onBookPress={(b) => router.push(`/reader/${b.id}` as any)}
                onBookLongPress={(b) => setSelectedWheelBook(b)}
              />
            )}

            {/* You Might Like Side-Scrolling Section */}
            {!searchQuery.trim() && (
              <YouMightLikeSection
                existingBooks={books}
                onBookPress={handleRecommendedBookPress}
                loadingBookId={loadingRecId}
              />
            )}

            {/* Favourites Section Header */}
            {books.length > 0 && (
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Favourites</Text>
                <TouchableOpacity
                  onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  style={styles.viewModeToggle}
                  accessible={true}
                  accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? (
                    <List size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  ) : (
                    <LayoutGrid size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>
                    {viewMode === 'grid' ? 'View list' : 'View grid'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <FilterBar
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
              selectedFormat={selectedFormat}
              onSelectFormat={setSelectedFormat}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              sortOption={sortOption}
              onSelectSort={setSortOption}
            />
          </View>
        }
        ListEmptyComponent={
          books.length === 0 ? (
            <EmptyLibrary onImportPress={handleImport} onExplorePress={() => router.push('/explore')} />
          ) : (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                No books match your current filters.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            viewMode={viewMode}
            onPress={() => router.push(`/reader/${item.id}` as any)}
            onLongPress={() => setSelectedWheelBook(item)}
          />
        )}
      />

      {/* Pinterest-like Wheel of Options */}
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
          await loadBooks();
          setSelectedWheelBook(null);
        }}
        onDeleteBook={async (b) => {
          await deleteBook(b.id);
          await loadBooks();
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
  heroSection: {
    marginBottom: 0,
  },
  heroSectionTitle: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: -0.1,
    opacity: 0.85,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchContainer: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 2,
  },
  sectionHeading: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
  },
  noResults: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
  },
});
