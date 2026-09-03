import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { Book } from '../../src/types';
import {
  getAllBooks,
  deleteBook as deleteBookQuery,
  toggleBookFavorite as toggleBookFavoriteQuery,
  updateBookStatus as updateBookStatusQuery,
} from '../../src/db/queries/books';
import {
  BookCard,
  FileBrowserModal,
  ShelfSummaryBanner,
  BatchActionBar,
  BookDetailsModal,
  BookContextMenuModal,
  SortModal,
  FormatModal,
  ShelfSortField,
  ShelfFormatType,
} from '../../src/components/library';
import {
  ContinueReadingCard,
} from '../../src/components/home';
import {
  Plus,
  Search,
  BookOpen,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  FileText,
  ChevronDown,
  FolderOpen,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { Book as BookType } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Books State
  const [deviceBooks, setDeviceBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  // Layout and Filter State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shelfStatusFilter, setShelfStatusFilter] = useState<'all' | 'reading' | 'unread' | 'finished' | 'favorite'>('all');
  const [shelfFormatFilter, setShelfFormatFilter] = useState<'all' | 'epub' | 'pdf' | 'cbz' | 'cbr' | 'fb2' | 'mobi' | 'txt'>('all');
  const [shelfSortBy, setShelfSortBy] = useState<ShelfSortField>('recent_read');
  const [shelfSortDirection, setShelfSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals State
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [contextMenuBook, setContextMenuBook] = useState<Book | null>(null);
  const [detailsModalBook, setDetailsModalBook] = useState<Book | null>(null);

  // Multi-Select Mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  // Load books from SQLite
  const loadDeviceBooks = useCallback(async () => {
    try {
      setIsLoadingBooks(true);
      const books = await getAllBooks();
      setDeviceBooks(books);
    } catch (e) {
      console.warn('Failed to load books in library:', e);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeviceBooks();
    }, [loadDeviceBooks])
  );

  // Filtered and Sorted Books
  const filteredDeviceBooks = useMemo(() => {
    let list = [...deviceBooks];

    // Status filter
    if (shelfStatusFilter === 'reading') {
      list = list.filter((b) => b.status === 'reading');
    } else if (shelfStatusFilter === 'unread') {
      list = list.filter((b) => b.status === 'unread');
    } else if (shelfStatusFilter === 'finished') {
      list = list.filter((b) => b.status === 'finished');
    } else if (shelfStatusFilter === 'favorite') {
      list = list.filter((b) => b.isFavorite);
    }

    // Format filter
    if (shelfFormatFilter !== 'all') {
      list = list.filter((b) => b.fileFormat?.toLowerCase() === shelfFormatFilter);
    }

    // Search query filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const authorMatch = b.authors?.some((a) => a.name.toLowerCase().includes(q));
        return titleMatch || authorMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      switch (shelfSortBy) {
        case 'recent_read':
          comparison = (new Date(b.lastReadAt || 0).getTime()) - (new Date(a.lastReadAt || 0).getTime());
          break;
        case 'recent_added':
          comparison = (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime());
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author': {
          const aAuthor = a.authors?.[0]?.name || '';
          const bAuthor = b.authors?.[0]?.name || '';
          comparison = aAuthor.localeCompare(bAuthor);
          break;
        }
        case 'progress':
          comparison = (b.progressPercentage || 0) - (a.progressPercentage || 0);
          break;
        case 'size':
          comparison = (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
          break;
        default:
          comparison = 0;
      }
      return shelfSortDirection === 'asc' ? -comparison : comparison;
    });

    return list;
  }, [deviceBooks, shelfStatusFilter, shelfFormatFilter, query, shelfSortBy, shelfSortDirection]);

  // Continue Reading data (reuses same logic as Home)
  const featuredBook = useMemo(() => {
    return (
      deviceBooks.find((b) => b.status === 'reading' && (b.progressPercentage || 0) > 0) ||
      deviceBooks.find((b) => (b.progressPercentage || 0) > 0) ||
      null
    );
  }, [deviceBooks]);

  // Total Shelf Metrics
  const totalSizeFormatted = useMemo(() => {
    const bytes = deviceBooks.reduce((acc, b) => acc + (b.fileSizeBytes || 0), 0);
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  }, [deviceBooks]);

  const readingCount = useMemo(() => deviceBooks.filter((b) => b.status === 'reading').length, [deviceBooks]);
  const completedCount = useMemo(() => deviceBooks.filter((b) => b.status === 'finished').length, [deviceBooks]);

  const formatLabel = useMemo(() => {
    switch (shelfFormatFilter) {
      case 'epub':
        return 'EPUB';
      case 'pdf':
        return 'PDF';
      case 'cbz':
      case 'cbr':
        return 'Comics';
      case 'fb2':
      case 'mobi':
        return 'FB2/MOBI';
      case 'txt':
        return 'TXT';
      default:
        return 'Format';
    }
  }, [shelfFormatFilter]);

  // Book Handlers
  const handleToggleFavorite = async (book: Book) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await toggleBookFavoriteQuery(book.id, book.isFavorite);
      await loadDeviceBooks();
      setContextMenuBook(null);
    } catch (e) {
      console.warn('Failed to toggle favorite:', e);
    }
  };

  const handleToggleStatus = async (book: Book) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const nextStatus = book.status === 'finished' ? 'reading' : 'finished';
      await updateBookStatusQuery(book.id, nextStatus);
      await loadDeviceBooks();
      setContextMenuBook(null);
    } catch (e) {
      console.warn('Failed to update status:', e);
    }
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}" from your device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookQuery(book.id);
              await loadDeviceBooks();
              setContextMenuBook(null);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            } catch (e) {
              Alert.alert('Error', 'Failed to delete book.');
            }
          },
        },
      ]
    );
  };

  const handlePickAndImport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      } else if (res.success) {
        await loadDeviceBooks();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (res.error && res.error !== 'Cancelled' && !res.error.toLowerCase().includes('cancel')) {
        Alert.alert('Import Notice', res.error);
      }
    } catch (err: any) {
      Alert.alert('Import Error', err?.message || 'Failed to import book.');
    }
  };

  // Multi-select Handlers
  const handleToggleSelectBook = (bookId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (selectedBookIds.length === filteredDeviceBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(filteredDeviceBooks.map((b) => b.id));
    }
  };

  const handleBatchFavorite = async () => {
    if (selectedBookIds.length === 0) return;
    try {
      await Promise.all(
        selectedBookIds.map((id) => {
          const b = deviceBooks.find((item) => item.id === id);
          return toggleBookFavoriteQuery(id, b?.isFavorite || false);
        })
      );
      await loadDeviceBooks();
      setSelectedBookIds([]);
      setIsSelectMode(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      Alert.alert('Error', 'Failed to update favorites.');
    }
  };

  const handleBatchMarkStatus = async (status: 'unread' | 'reading' | 'finished') => {
    if (selectedBookIds.length === 0) return;
    try {
      await Promise.all(selectedBookIds.map((id) => updateBookStatusQuery(id, status)));
      await loadDeviceBooks();
      setSelectedBookIds([]);
      setIsSelectMode(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      Alert.alert('Error', 'Failed to update book statuses.');
    }
  };

  const handleBatchDelete = () => {
    if (selectedBookIds.length === 0) return;
    Alert.alert(
      'Delete Selected Books',
      `Are you sure you want to permanently delete ${selectedBookIds.length} ${
        selectedBookIds.length === 1 ? 'book' : 'books'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(selectedBookIds.map((id) => deleteBookQuery(id)));
              await loadDeviceBooks();
              setSelectedBookIds([]);
              setIsSelectMode(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            } catch (e) {
              Alert.alert('Error', 'Failed to delete selected books.');
            }
          },
        },
      ]
    );
  };

  // Chunked data for single FlatList column in grid mode
  const renderedListData = useMemo(() => {
    if (viewMode === 'grid') {
      const rows: any[][] = [];
      for (let i = 0; i < filteredDeviceBooks.length; i += 2) {
        rows.push(filteredDeviceBooks.slice(i, i + 2));
      }
      return rows;
    }
    return filteredDeviceBooks;
  }, [filteredDeviceBooks, viewMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Library</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsSearchOpen((prev) => {
                const next = !prev;
                if (!next) setQuery('');
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsImportModalOpen(true);
            }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isImportModalOpen ? colors.surface : colors.canvas,
                borderColor: isImportModalOpen ? colors.accent : colors.border,
              },
            ]}
            accessible={true}
            accessibilityLabel="My Files Storage Browser"
          >
            <FolderOpen size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickAndImport}
            style={[styles.importIconBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Import Local Books"
          >
            <Plus size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main FlatList */}
      <FlatList
        data={renderedListData as any}
        keyExtractor={(item) =>
          Array.isArray(item) ? item.map((b: any) => b.id).join('_') : item.id
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.searchHeader}>
            {/* Continue Reading Hero Card */}
            {featuredBook && (
              <View style={styles.continueReadingSection}>
                <Text style={[styles.continueReadingLabel, { color: colors.textSecondary }]}>
                  CONTINUE READING
                </Text>
                <ContinueReadingCard
                  book={featuredBook}
                  onPress={() => router.push(`/reader/${featuredBook.id}` as any)}
                  onLongPress={() => setContextMenuBook(featuredBook)}
                  onOptionsPress={() => setContextMenuBook(featuredBook)}
                />
              </View>
            )}

            {/* Shelf Summary Banner */}
            <ShelfSummaryBanner
              total={deviceBooks.length}
              reading={readingCount}
              completed={completedCount}
              totalSizeFormatted={totalSizeFormatted}
              isSelectMode={isSelectMode}
              onToggleSelectMode={() => {
                setIsSelectMode((prev) => {
                  const next = !prev;
                  if (!next) setSelectedBookIds([]);
                  return next;
                });
              }}
            />

            {/* Batch Action Bar */}
            {isSelectMode && (
              <BatchActionBar
                selectedCount={selectedBookIds.length}
                totalFilteredCount={filteredDeviceBooks.length}
                onSelectAll={handleSelectAll}
                onBatchFavorite={handleBatchFavorite}
                onBatchMarkStatus={handleBatchMarkStatus}
                onBatchDelete={handleBatchDelete}
              />
            )}

            {/* Collapsible Search Bar */}
            {isSearchOpen && (
              <View
                style={[
                  styles.searchBarBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Search size={15} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search titles, authors..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  returnKeyType="search"
                  autoFocus={true}
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setQuery('')}
                    style={styles.clearBtn}
                    accessible={true}
                    accessibilityLabel="Clear Search"
                  >
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Status Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRowScroll}
            >
              {[
                { id: 'all', label: 'All' },
                { id: 'reading', label: 'Reading' },
                { id: 'unread', label: 'Unread' },
                { id: 'finished', label: 'Finished' },
                { id: 'favorite', label: 'Favorites' },
              ].map((filter) => {
                const isSelected = shelfStatusFilter === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setShelfStatusFilter(filter.id as any);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isSelected
                            ? colors.isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textPrimary,
                          fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                        },
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Shelf Sort & View Mode Row */}
            <View style={styles.sortRow}>
              <View style={styles.sortLeftActions}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setIsSortModalOpen(true);
                  }}
                  style={[
                    styles.sortBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  accessible={true}
                  accessibilityLabel="Sort options"
                >
                  <ArrowUpDown size={13} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.sortBtnText, { color: colors.textPrimary }]}>
                    {shelfSortBy === 'recent_read'
                      ? 'Recently Read'
                      : shelfSortBy === 'recent_added'
                        ? 'Recently Added'
                        : shelfSortBy === 'title'
                          ? 'Title'
                          : shelfSortBy === 'author'
                            ? 'Author'
                            : shelfSortBy === 'progress'
                              ? 'Progress'
                              : 'File Size'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setShelfSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                  style={[
                    styles.directionBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  accessible={true}
                  accessibilityLabel={`Sort ${shelfSortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                  <Text style={[styles.directionBtnText, { color: colors.textSecondary }]}>
                    {shelfSortDirection === 'asc' ? '↑' : '↓'}
                  </Text>
                </TouchableOpacity>

                {/* Format Dropdown Button */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setIsFormatModalOpen(true);
                  }}
                  style={[
                    styles.formatDropdownBtn,
                    {
                      backgroundColor:
                        shelfFormatFilter !== 'all'
                          ? colors.isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.04)'
                          : colors.surface,
                      borderColor: shelfFormatFilter !== 'all' ? colors.accent : colors.border,
                    },
                  ]}
                  accessible={true}
                  accessibilityLabel={`Filter by format, currently ${formatLabel}`}
                >
                  <FileText
                    size={12}
                    color={shelfFormatFilter !== 'all' ? colors.accent : colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.formatDropdownBtnText,
                      {
                        color: shelfFormatFilter !== 'all' ? colors.accent : colors.textPrimary,
                        fontFamily:
                          shelfFormatFilter !== 'all' ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    {formatLabel}
                  </Text>
                  <ChevronDown
                    size={12}
                    color={shelfFormatFilter !== 'all' ? colors.accent : colors.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.sortRightActions}>
                <Text style={[styles.bookCountBadge, { color: colors.textSecondary }]}>
                  {filteredDeviceBooks.length}{' '}
                  {filteredDeviceBooks.length === 1 ? 'BOOK' : 'BOOKS'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
                  }}
                  style={[
                    styles.viewModeToggleBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  accessible={true}
                  accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? (
                    <List size={14} color={colors.textPrimary} />
                  ) : (
                    <LayoutGrid size={14} color={colors.textPrimary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (viewMode === 'grid') {
            const row = item as Book[];
            return (
              <View style={styles.gridRow}>
                {row.map((shelfBook) => (
                  <View key={shelfBook.id} style={{ width: GRID_CARD_WIDTH }}>
                    <BookCard
                      book={shelfBook}
                      viewMode="grid"
                      isSelectMode={isSelectMode}
                      isSelected={selectedBookIds.includes(shelfBook.id)}
                      onSelect={() => handleToggleSelectBook(shelfBook.id)}
                      onPress={() => router.push(`/reader/${shelfBook.id}` as any)}
                      onLongPress={() => setContextMenuBook(shelfBook)}
                    />
                  </View>
                ))}
                {row.length === 1 && <View style={{ width: GRID_CARD_WIDTH }} />}
              </View>
            );
          }

          // List View Mode
          const shelfBook = item as Book;
          return (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <BookCard
                book={shelfBook}
                viewMode="list"
                isSelectMode={isSelectMode}
                isSelected={selectedBookIds.includes(shelfBook.id)}
                onSelect={() => handleToggleSelectBook(shelfBook.id)}
                onPress={() => router.push(`/reader/${shelfBook.id}` as any)}
                onLongPress={() => setContextMenuBook(shelfBook)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          isLoadingBooks ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Loading your library...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color={colors.accent} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Books Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {query.trim()
                  ? 'No books match your search.'
                  : shelfStatusFilter !== 'all' || shelfFormatFilter !== 'all'
                    ? 'No books match your current filters.'
                    : 'Your library is empty. Tap the + icon to import books.'}
              </Text>
            </View>
          )
        }
      />

      {/* Sort Options Modal */}
      <SortModal
        visible={isSortModalOpen}
        sortBy={shelfSortBy}
        onSelectSort={(newSort) => setShelfSortBy(newSort)}
        onClose={() => setIsSortModalOpen(false)}
      />

      {/* Format Filter Modal */}
      <FormatModal
        visible={isFormatModalOpen}
        selectedFormat={shelfFormatFilter as ShelfFormatType}
        onSelectFormat={(newFormat) => setShelfFormatFilter(newFormat)}
        onClose={() => setIsFormatModalOpen(false)}
      />

      {/* Book Context Menu Modal */}
      <BookContextMenuModal
        visible={!!contextMenuBook}
        book={contextMenuBook}
        onClose={() => setContextMenuBook(null)}
        onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
        onOpenDetails={(book) => setDetailsModalBook(book)}
        onToggleFavorite={handleToggleFavorite}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteBook}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        visible={!!detailsModalBook}
        book={detailsModalBook}
        onClose={() => setDetailsModalBook(null)}
        onOpenReader={(bookId) => router.push(`/reader/${bookId}` as any)}
      />

      {/* Import File Browser Modal */}
      <FileBrowserModal
        visible={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCompleted={() => {
          setIsImportModalOpen(false);
          loadDeviceBooks();
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
  importIconBtn: {
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
    paddingBottom: 110,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  continueReadingSection: {
    marginBottom: 16,
    marginTop: 8,
  },
  continueReadingLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 10,
    marginLeft: 2,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  filterRowScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  formatChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  formatChipText: {
    fontSize: 11,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 14,
  },
  sortLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
  },
  directionBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionBtnText: {
    fontSize: 13,
  },
  formatDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  formatDropdownBtnText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  sortRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookCountBadge: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  viewModeToggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
});
