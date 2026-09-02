import React, { useState, useCallback } from 'react';
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
import { BookCard } from '../../src/components/library/BookCard';
import { FilterBar } from '../../src/components/library/FilterBar';
import { EmptyLibrary } from '../../src/components/library/EmptyLibrary';
import { SearchBar } from '../../src/components/common/SearchBar';
import { RadialOptionsMenu } from '../../src/components/library/RadialOptionsMenu';
import { YouMightLikeSection } from '../../src/components/library/YouMightLikeSection';
import { ContinueStartedSection } from '../../src/components/library/ContinueStartedSection';
import { CustomOPDSModal } from '../../src/components/library/CustomOPDSModal';
import { FileBrowserModal } from '../../src/components/library/FileBrowserModal';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { useLibrary } from '../../src/hooks/useLibrary';
import {
  downloadRecommendedBook,
  RecommendedBook,
} from '../../src/services/recommendations/recommendationService';
import { toggleBookFavorite, updateBookStatus, deleteBook } from '../../src/db/queries/books';
import { Book } from '../../src/types';
import { Plus, Search, LayoutGrid, List, Globe, FolderOpen } from 'lucide-react-native';
import { ContinueReadingCard } from '../../src/components/library/ContinueReadingCard';
import { FONTS } from '../../src/utils/typography';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    books,
    filteredBooks,
    featuredBook,
    inProgressBooks,
    favoriteBooks,
    allTags,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedFormat,
    setSelectedFormat,
    selectedTagId,
    setSelectedTagId,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    toggleFavorite,
    updateRating,
    loadBooks,
    onRefresh,
  } = useLibrary();

  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const [selectedWheelBook, setSelectedWheelBook] = useState<Book | null>(null);
  const [loadingRecId, setLoadingRecId] = useState<string | null>(null);
  const [isOPDSModalOpen, setIsOPDSModalOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);

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
      {/* Top Header — matches Settings/Stats design language */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Readr</Text>

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
            <Search size={18} color={isSearchOpen ? colors.accent : colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsFileBrowserOpen(true)}
            style={[
              styles.iconBtn,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            accessible={true}
            accessibilityLabel="My Files Storage Browser"
          >
            <FolderOpen size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImport}
            style={[styles.importBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Import Book"
          >
            <Plus size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Container */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
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

        {/* Your Library Section Header */}
        {books.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                YOUR LIBRARY
              </Text>
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
                  {viewMode === 'grid' ? 'List' : 'Grid'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <FilterBar
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          sortOption={sortOption}
          onSelectSort={setSortOption}
          allTags={allTags}
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />

        {/* Books List / Grid */}
        {books.length === 0 ? (
          <EmptyLibrary
            onImportPress={handleImport}
            onExplorePress={() => router.push('/explore')}
          />
        ) : filteredBooks.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              No books match your current filters.
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {filteredBooks.map((item) => (
              <View key={item.id} style={styles.gridItemWrapper}>
                <BookCard
                  book={item}
                  viewMode="grid"
                  onPress={() => router.push(`/reader/${item.id}` as any)}
                  onLongPress={() => setSelectedWheelBook(item)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listCardContainer}>
            {filteredBooks.map((item) => (
              <BookCard
                key={item.id}
                book={item}
                viewMode="list"
                onPress={() => router.push(`/reader/${item.id}` as any)}
                onLongPress={() => setSelectedWheelBook(item)}
              />
            ))}
          </View>
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
          await loadBooks();
          setSelectedWheelBook(null);
        }}
        onUpdateRating={async (b, r) => {
          await updateRating(b.id, r);
        }}
        onDeleteBook={async (b) => {
          await deleteBook(b.id);
          await loadBooks();
          setSelectedWheelBook(null);
        }}
      />

      {/* OPDS & Net Library Catalog Modal */}
      <CustomOPDSModal
        visible={isOPDSModalOpen}
        onClose={() => setIsOPDSModalOpen(false)}
        onBookImported={() => loadBooks()}
      />

      {/* In-App "My Files" Storage Browser Modal */}
      <FileBrowserModal
        visible={isFileBrowserOpen}
        onClose={() => setIsFileBrowserOpen(false)}
        onImportCompleted={() => loadBooks()}
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
    gap: 10,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  searchContainer: {
    marginBottom: 14,
  },
  heroSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  gridItemWrapper: {
    width: '48%',
  },
  listCardContainer: {
    flexDirection: 'column',
    paddingTop: 4,
  },
  noResults: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
