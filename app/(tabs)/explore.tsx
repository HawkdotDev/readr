import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { SearchBar } from '../../src/components/common/SearchBar';
import { Badge } from '../../src/components/common/Badge';
import { OPDSBookEntry, Book } from '../../src/types';
import { fetchOPDSCatalog, downloadOPDSBook } from '../../src/services/opds/opdsService';
import { getAllBooks } from '../../src/db/queries/books';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { Download, BookOpen, Compass, HardDrive, Plus, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';
import { formatDurationSeconds } from '../../src/utils/time';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Mode: 'explore' (online / public domain catalog) vs 'shelf' (all books on local device)
  const [activeTab, setActiveTab] = useState<'explore' | 'shelf'>('explore');
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<OPDSBookEntry[]>([]);
  const [deviceBooks, setDeviceBooks] = useState<Book[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoadingDevice, setIsLoadingDevice] = useState(false);

  // Fetch online catalog
  useEffect(() => {
    if (activeTab === 'explore') {
      fetchOPDSCatalog(query).then(setCatalog);
    }
  }, [query, activeTab]);

  // Load device books from local storage/SQLite
  const loadDeviceBooks = useCallback(async () => {
    try {
      setIsLoadingDevice(true);
      const books = await getAllBooks();
      setDeviceBooks(books);
    } catch (e) {
      console.warn('Failed to load device books in explore:', e);
    } finally {
      setIsLoadingDevice(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeviceBooks();
    }, [loadDeviceBooks])
  );

  const handleDownload = async (book: OPDSBookEntry) => {
    setDownloadingId(book.id);
    const res = await downloadOPDSBook(book);
    setDownloadingId(null);

    if (res.success && res.bookId) {
      await loadDeviceBooks();
      Alert.alert(
        'Download Complete',
        `"${book.title}" is now in your library.`,
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Read Now', onPress: () => router.push(`/reader/${res.bookId}` as any) },
        ]
      );
    } else if (res.isDuplicate && res.bookId) {
      Alert.alert(
        'Already in Library',
        `"${book.title}" is already in your library.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Book', onPress: () => router.push(`/reader/${res.bookId}` as any) },
        ]
      );
    } else {
      Alert.alert('Notice', res.error || 'Failed to download book.');
    }
  };

  const handleImport = async () => {
    const res = await pickAndImportBook();
    if (!res) return;

    if (res.isDuplicate && res.bookId) {
      Alert.alert('Book Already in Library', 'This book has already been imported.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Book', onPress: () => router.push(`/reader/${res.bookId}` as any) },
      ]);
      return;
    }

    if (res.success && res.bookId) {
      await loadDeviceBooks();
      router.push(`/reader/${res.bookId}` as any);
    } else if (res.error) {
      Alert.alert('Import Notice', res.error);
    }
  };

  // Filtered device books
  const filteredDeviceBooks = React.useMemo(() => {
    if (!query.trim()) return deviceBooks;
    const q = query.toLowerCase().trim();
    return deviceBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.authors && b.authors.some((a) => a.name.toLowerCase().includes(q))) ||
        b.fileFormat.toLowerCase().includes(q)
    );
  }, [deviceBooks, query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {activeTab === 'explore' ? 'Library' : 'Device Shelf'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {activeTab === 'explore'
              ? 'Discover public domain classics'
              : `${deviceBooks.length} books stored on device`}
          </Text>
        </View>

        {activeTab === 'shelf' ? (
          <TouchableOpacity
            onPress={handleImport}
            style={[styles.importIconBtn, { backgroundColor: colors.accent }]}
            accessible={true}
            accessibilityLabel="Import Book to Device Shelf"
          >
            <Plus size={20} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        ) : (
          <Compass size={26} color={colors.accent} />
        )}
      </View>

      {/* Main List Container */}
      <FlatList
        data={activeTab === 'explore' ? catalog : (filteredDeviceBooks as any)}
        keyExtractor={(item) => item.id}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        updateCellsBatchingPeriod={40}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.searchHeader}>
            {/* View Switcher Toggle (Explore vs Shelf View) */}
            <View style={styles.toggleContainer}>
              <View
                style={[
                  styles.toggleCapsule,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.toggleTab,
                    activeTab === 'explore' && [
                      styles.activeToggleTab,
                      { backgroundColor: colors.accent },
                    ],
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setActiveTab('explore');
                  }}
                  accessible={true}
                  accessibilityLabel="Explore Public Domain Works"
                >
                  <Compass
                    size={16}
                    color={
                      activeTab === 'explore'
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.toggleTabText,
                      {
                        color:
                          activeTab === 'explore'
                            ? colors.isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textSecondary,
                        fontFamily:
                          activeTab === 'explore' ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    Explore
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleTab,
                    activeTab === 'shelf' && [
                      styles.activeToggleTab,
                      { backgroundColor: colors.accent },
                    ],
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setActiveTab('shelf');
                    loadDeviceBooks();
                  }}
                  accessible={true}
                  accessibilityLabel="Device Shelf View"
                >
                  <HardDrive
                    size={16}
                    color={
                      activeTab === 'shelf'
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textSecondary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.toggleTabText,
                      {
                        color:
                          activeTab === 'shelf'
                            ? colors.isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textSecondary,
                        fontFamily:
                          activeTab === 'shelf' ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    Device Shelf
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={
                activeTab === 'explore'
                  ? 'Search public domain classics...'
                  : 'Search books on your device...'
              }
            />

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {activeTab === 'explore'
                ? 'FEATURED PUBLIC DOMAIN WORKS'
                : `LOCAL DEVICE BOOKS (${filteredDeviceBooks.length})`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          activeTab === 'shelf' ? (
            <View style={styles.emptyContainer}>
              <HardDrive size={42} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {query.trim() ? 'No matching device books' : 'No books found on device'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {query.trim()
                  ? 'Try searching with a different keyword.'
                  : 'Import EPUB, PDF, TXT or Markdown files to view them here.'}
              </Text>
              {!query.trim() && (
                <TouchableOpacity
                  onPress={handleImport}
                  style={[styles.emptyActionBtn, { backgroundColor: colors.accent }]}
                >
                  <Plus size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyActionText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
                    Import from Device
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (activeTab === 'explore') {
            const opdsItem = item as OPDSBookEntry;
            const isDownloading = downloadingId === opdsItem.id;

            return (
              <View
                style={[
                  styles.bookCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Cover Artwork */}
                <View
                  style={[
                    styles.coverBox,
                    { backgroundColor: colors.canvas, borderColor: colors.border },
                  ]}
                >
                  {opdsItem.coverUrl ? (
                    <Image
                      source={{ uri: opdsItem.coverUrl }}
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <BookOpen size={24} color={colors.accent} />
                  )}
                </View>

                {/* Book Info */}
                <View style={styles.cardDetails}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                      {opdsItem.title}
                    </Text>
                  </View>

                  <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
                    {opdsItem.author || 'Public Domain'}
                  </Text>

                  {opdsItem.summary && (
                    <Text
                      style={[styles.summary, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {opdsItem.summary}
                    </Text>
                  )}

                  <View style={styles.footerRow}>
                    <Badge label={opdsItem.fileFormat.toUpperCase()} variant="secondary" />
                    {opdsItem.published && (
                      <Text style={[styles.pubDate, { color: colors.textSecondary }]}>
                        {opdsItem.published}
                      </Text>
                    )}

                    {/* Download Action */}
                    <TouchableOpacity
                      onPress={() => handleDownload(opdsItem)}
                      disabled={isDownloading}
                      style={[
                        styles.downloadBtn,
                        {
                          backgroundColor: colors.accent,
                          opacity: isDownloading ? 0.7 : 1,
                        },
                      ]}
                    >
                      {isDownloading ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.isDark ? '#000000' : '#FFFFFF'}
                        />
                      ) : (
                        <>
                          <Download
                            size={14}
                            color={colors.isDark ? '#000000' : '#FFFFFF'}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.downloadBtnText,
                              { color: colors.isDark ? '#000000' : '#FFFFFF' },
                            ]}
                          >
                            Get
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }

          // Device Shelf Row View
          const bookItem = item as Book;
          const authorName =
            bookItem.authors && bookItem.authors.length > 0
              ? bookItem.authors.map((a) => a.name).join(', ')
              : 'Unknown Author';
          const progress = Math.round(bookItem.progressPercentage || 0);

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/reader/${bookItem.id}` as any)}
              onLongPress={() => router.push(`/book/${bookItem.id}` as any)}
              style={[
                styles.bookCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Cover Box */}
              <View
                style={[
                  styles.coverBox,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                {bookItem.coverImagePath ? (
                  <Image
                    source={{ uri: bookItem.coverImagePath }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <BookOpen size={24} color={colors.accent} />
                )}
              </View>

              {/* Card Details */}
              <View style={styles.cardDetails}>
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                  {bookItem.title}
                </Text>
                <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
                  {authorName}
                </Text>

                {/* Progress bar */}
                <View style={styles.shelfProgressRow}>
                  <View style={[styles.shelfProgressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.shelfProgressFill,
                        {
                          width: `${Math.max(4, progress)}%`,
                          backgroundColor: colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.shelfPercentText, { color: colors.textSecondary }]}>
                    {progress > 0 ? `${progress}%` : 'Unread'}
                  </Text>
                </View>

                <View style={styles.footerRow}>
                  <Badge label={bookItem.fileFormat.toUpperCase()} variant="secondary" />
                  {bookItem.totalTimeReadSeconds > 0 ? (
                    <View style={styles.timeTag}>
                      <Clock size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.pubDate, { color: colors.textSecondary }]}>
                        {formatDurationSeconds(bookItem.totalTimeReadSeconds)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.pubDate, { color: colors.textSecondary }]}>
                      {bookItem.pageCount > 0 ? `${bookItem.pageCount} pages` : 'Ready to read'}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => router.push(`/reader/${bookItem.id}` as any)}
                    style={[styles.readBtn, { backgroundColor: colors.accent }]}
                  >
                    <BookOpen
                      size={13}
                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.readBtnText,
                        { color: colors.isDark ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      {progress > 0 ? 'Resume' : 'Read'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
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
    fontSize: 26,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  importIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  searchHeader: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  toggleContainer: {
    marginBottom: 14,
    alignItems: 'center',
  },
  toggleCapsule: {
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: 1,
    padding: 3,
    width: '100%',
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 18,
  },
  activeToggleTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleTabText: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bookCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  coverBox: {
    width: 58,
    height: 84,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  author: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  summary: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  shelfProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  shelfProgressTrack: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  shelfProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  shelfPercentText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pubDate: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 8,
  },
  downloadBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 8,
  },
  readBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
