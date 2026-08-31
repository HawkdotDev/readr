import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { BookCard } from '../../src/components/library/BookCard';
import { FilterBar } from '../../src/components/library/FilterBar';
import { EmptyLibrary } from '../../src/components/library/EmptyLibrary';
import { SearchBar } from '../../src/components/common/SearchBar';
import { getAllBooks } from '../../src/db/queries/books';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { Book, BookStatus, BookFormat } from '../../src/types';
import { useLibraryStore } from '../../src/store/libraryStore';
import { Plus, Search } from 'lucide-react-native';

export default function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
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
  } = useLibraryStore();

  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));

  const loadBooks = async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (e) {
      console.warn('Failed to load books:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
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

  // Filter & Sort Logic
  const filteredBooks = books.filter((b) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.authors?.some((a) => a.name.toLowerCase().includes(q)) ?? false;
      if (!matchTitle && !matchAuthor) return false;
    }

    // 2. Reading Status
    if (selectedStatus !== 'all' && b.status !== selectedStatus) {
      return false;
    }

    // 3. Format
    if (selectedFormat !== 'all' && b.fileFormat !== selectedFormat) {
      return false;
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Library</Text>

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
                backgroundColor: isSearchOpen ? colors.surface : 'transparent',
                borderColor: isSearchOpen ? colors.border : 'transparent',
              },
            ]}
            accessible={true}
            accessibilityLabel="Search Library"
          >
            <Search size={21} color={colors.textPrimary} />
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
            onLongPress={() => router.push(`/book/${item.id}` as any)}
          />
        )}
      />
    </View>
  );
}

import { FONTS } from '../../src/utils/typography';

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
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    paddingBottom: 40,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    marginBottom: 12,
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
