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
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { OPDSBookEntry, OPDSServer } from '../../src/types';
import {
  fetchOPDSCatalog,
  fetchRemoteOPDSCatalog,
  downloadOPDSBook,
  CURATED_PUBLIC_DOMAIN_BOOKS,
} from '../../src/services/opds/opdsService';
import {
  getAllOPDSServers,
  saveOPDSServer,
  deleteOPDSServer,
  DEFAULT_OPDS_SERVERS,
} from '../../src/db/queries/opds';
import { getAllBooks } from '../../src/db/queries/books';
import {
  ServerHub,
  PopularBooksSection,
  RecommendedBooksSection,
  OPDSBookCard,
  AddServerModal,
  SelectCategoryModal,
} from '../../src/components/explore';
import { GenresSection } from '../../src/components/home';
import {
  downloadRecommendedBook,
  RecommendedBook,
} from '../../src/services/recommendations/recommendationService';
import {
  Plus,
  Search,
  Server,
  LayoutGrid,
  List,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';

const ALL_SERVERS_OPTION: OPDSServer = {
  id: 'all_servers',
  title: 'All Servers',
  url: 'Unified public domain feeds',
  icon: 'globe',
  createdAt: new Date(),
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [isServerSearchOpen, setIsServerSearchOpen] = useState(false);

  // OPDS State
  const [servers, setServers] = useState<OPDSServer[]>(DEFAULT_OPDS_SERVERS);
  const [selectedServer, setSelectedServer] = useState<OPDSServer>(DEFAULT_OPDS_SERVERS[0]);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [serverCategory, setServerCategory] = useState<'default' | 'custom' | 'all'>('default');
  const [catalog, setCatalog] = useState<OPDSBookEntry[]>(CURATED_PUBLIC_DOMAIN_BOOKS);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Download & Device Books state
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loadingGenreBookId, setLoadingGenreBookId] = useState<string | null>(null);

  // Add OPDS Server Modal State
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);

  // Custom servers list
  const customServers = useMemo(() => {
    return servers.filter((s) => !DEFAULT_OPDS_SERVERS.some((d) => d.id === s.id));
  }, [servers]);

  // Filter visible horizontal pills based on active category
  const visibleServers = useMemo(() => {
    if (serverCategory === 'default') {
      return servers.filter((s) => DEFAULT_OPDS_SERVERS.some((d) => d.id === s.id));
    }
    if (serverCategory === 'custom') {
      return customServers;
    }
    return [ALL_SERVERS_OPTION, ...servers];
  }, [servers, customServers, serverCategory]);

  // Displayed catalog taking custom empty state into account
  const displayedCatalog = useMemo(() => {
    if (serverCategory === 'custom' && customServers.length === 0) return [];
    return catalog;
  }, [serverCategory, customServers.length, catalog]);

  // Handle selecting a category from the Select Feed popup
  const handleSelectCategory = (category: 'default' | 'custom' | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setServerCategory(category);
    setIsServerDropdownOpen(false);

    if (category === 'default') {
      const defaultList = servers.filter((s) => DEFAULT_OPDS_SERVERS.some((d) => d.id === s.id));
      if (defaultList.length > 0) {
        setSelectedServer(defaultList[0]);
      }
    } else if (category === 'custom') {
      if (customServers.length > 0) {
        setSelectedServer(customServers[0]);
      } else {
        setSelectedServer(null as any);
        setCatalog([]);
      }
    } else {
      setSelectedServer(ALL_SERVERS_OPTION);
    }
  };

  // Load Servers from DB
  const loadServers = useCallback(async () => {
    try {
      const list = await getAllOPDSServers();
      setServers(list);
      if (!selectedServer && list.length > 0) {
        setSelectedServer(list[0]);
      }
    } catch (e) {
      console.warn('Failed to load OPDS servers:', e);
    }
  }, [selectedServer]);

  // Load Device Books to identify already downloaded titles
  const loadDeviceBooks = useCallback(async () => {
    try {
      const books = await getAllBooks();
      setDownloadedBookIds(books.map((b) => b.title.toLowerCase().trim()));
    } catch (e) {
      console.warn('Failed to load device books in explore:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadServers();
      loadDeviceBooks();
    }, [loadServers, loadDeviceBooks])
  );

  // Fetch Catalog for Selected Server
  const fetchServerCatalog = useCallback(
    async (server: OPDSServer, searchTerms?: string) => {
      if (!server) return;
      setIsLoadingCatalog(true);
      setCatalogError(null);

      try {
        if (server.id === 'all_servers') {
          const res = await fetchOPDSCatalog('all_servers', searchTerms || query);

          if (customServers.length > 0) {
            const customResults = await Promise.allSettled(
              customServers.map((s) =>
                fetchRemoteOPDSCatalog(s.url, s.username, s.password, searchTerms || query)
              )
            );
            const customEntries = customResults
              .filter(
                (r): r is PromiseFulfilledResult<{ entries: OPDSBookEntry[] }> =>
                  r.status === 'fulfilled' && !r.value.error
              )
              .flatMap((r) => r.value.entries);

            const seenTitles = new Set(res.map((b) => b.title.toLowerCase().trim()));
            const uniqueCustom = customEntries.filter(
              (b) => !seenTitles.has(b.title.toLowerCase().trim())
            );
            setCatalog([...res, ...uniqueCustom]);
          } else {
            setCatalog(res);
          }
        } else if (DEFAULT_OPDS_SERVERS.some((d) => d.id === server.id)) {
          const res = await fetchOPDSCatalog(server.id, searchTerms || query);
          setCatalog(res);
        } else {
          const res = await fetchRemoteOPDSCatalog(
            server.url,
            server.username,
            server.password,
            searchTerms || query
          );
          if (res.error) {
            setCatalogError(res.error);
            setCatalog([]);
          } else {
            setCatalog(res.entries);
          }
        }
      } catch (err: any) {
        setCatalogError(err?.message || 'Failed to connect to OPDS server.');
        setCatalog(CURATED_PUBLIC_DOMAIN_BOOKS);
      } finally {
        setIsLoadingCatalog(false);
      }
    },
    [query, customServers]
  );

  useEffect(() => {
    if (selectedServer) {
      fetchServerCatalog(selectedServer, query);
    }
  }, [selectedServer, query]);

  // Handle Download and Ingest into SQLite
  const handleDownload = useCallback(async (book: OPDSBookEntry) => {
    setDownloadingId(book.id);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const res = await downloadOPDSBook(book);
      setDownloadingId(null);

      if (res.success && res.bookId) {
        await loadDeviceBooks();
        setDownloadedBookIds((prev) => [...prev, book.title.toLowerCase().trim()]);
        Alert.alert(
          'Download Complete',
          `"${book.title}" is now available in your local library.`,
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Read Now',
              onPress: () => router.push(`/reader/${res.bookId}` as any),
            },
          ]
        );
      } else if (res.isDuplicate && res.bookId) {
        Alert.alert(
          'Already in Library',
          `"${book.title}" is already stored in your library.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Book',
              onPress: () => router.push(`/reader/${res.bookId}` as any),
            },
          ]
        );
      } else {
        Alert.alert('Download Notice', res.error || 'Failed to download book.');
      }
    } catch (err: any) {
      setDownloadingId(null);
      Alert.alert('Download Notice', err?.message || 'Failed to download book.');
    }
  }, [loadDeviceBooks, router]);

  // Handle tapping a genre pill or Browse All in Featured Genres
  const handleGenrePress = useCallback(
    (genreName: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setIsServerSearchOpen(true);
      setQuery(genreName);
      if (selectedServer) {
        fetchServerCatalog(selectedServer, genreName);
      }
    },
    [selectedServer, fetchServerCatalog]
  );

  // Handle tapping a featured book inside GenresSection
  const handleGenreBookPress = useCallback(
    async (rec: RecommendedBook) => {
      try {
        setLoadingGenreBookId(rec.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        const res = await downloadRecommendedBook(rec);
        if (res.success && res.bookId) {
          await loadDeviceBooks();
          setDownloadedBookIds((prev) => [...prev, rec.title.toLowerCase().trim()]);
          Alert.alert(
            'Download Complete',
            `"${rec.title}" is now available in your local library.`,
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Read Now',
                onPress: () => router.push(`/reader/${res.bookId}` as any),
              },
            ]
          );
        } else if (res.isDuplicate && res.bookId) {
          Alert.alert(
            'Already in Library',
            `"${rec.title}" is already stored in your library.`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Book',
                onPress: () => router.push(`/reader/${res.bookId}` as any),
              },
            ]
          );
        } else if (res.error) {
          Alert.alert('Download Notice', res.error);
        }
      } catch (err: any) {
        Alert.alert('Download Notice', err?.message || 'Failed to download book.');
      } finally {
        setLoadingGenreBookId(null);
      }
    },
    [loadDeviceBooks, router]
  );

  // Handle Save New OPDS Server
  const handleSaveNewServer = async (serverData: {
    title: string;
    url: string;
    username?: string;
    password?: string;
  }) => {
    const saved = await saveOPDSServer({
      title: serverData.title,
      url: serverData.url,
      username: serverData.username || null,
      password: serverData.password || null,
      icon: 'server',
    });

    await loadServers();
    setSelectedServer(saved);
    setServerCategory('custom');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  // Handle Delete Custom Server
  const handleDeleteServer = (server: OPDSServer) => {
    Alert.alert(
      'Remove Server',
      `Are you sure you want to remove "${server.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteOPDSServer(server.id);
            await loadServers();
            setSelectedServer(DEFAULT_OPDS_SERVERS[0]);
            setServerCategory('default');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          },
        },
      ]
    );
  };

  // 4 Popular books from the default server not on device
  const popularBooks = useMemo(() => {
    const notOnDevice = catalog.filter(
      (b) => !downloadedBookIds.includes(b.title.toLowerCase().trim())
    );
    if (notOnDevice.length >= 4) {
      return notOnDevice.slice(0, 4);
    }
    const extra = CURATED_PUBLIC_DOMAIN_BOOKS.filter(
      (b) =>
        !downloadedBookIds.includes(b.title.toLowerCase().trim()) &&
        !notOnDevice.some((d) => d.id === b.id)
    );
    return [...notOnDevice, ...extra].slice(0, 4);
  }, [catalog, downloadedBookIds]);

  // 6 Recommended books from the default server not on device
  const recommendedBooks = useMemo(() => {
    const notOnDevice = catalog.filter(
      (b) =>
        !downloadedBookIds.includes(b.title.toLowerCase().trim()) &&
        !popularBooks.some((p) => p.id === b.id)
    );
    if (notOnDevice.length >= 6) {
      return notOnDevice.slice(0, 6);
    }
    const extra = CURATED_PUBLIC_DOMAIN_BOOKS.filter(
      (b) =>
        !downloadedBookIds.includes(b.title.toLowerCase().trim()) &&
        !popularBooks.some((p) => p.id === b.id) &&
        !notOnDevice.some((r) => r.id === b.id)
    );
    return [...notOnDevice, ...extra].slice(0, 6);
  }, [catalog, popularBooks, downloadedBookIds]);

  const isDefaultExploreView = serverCategory === 'default' && !query.trim();

  // Chunked data for persistent single-column FlatList
  const renderedListData = useMemo(() => {
    if (viewMode === 'grid') {
      const rows: any[][] = [];
      for (let i = 0; i < displayedCatalog.length; i += 2) {
        rows.push(displayedCatalog.slice(i, i + 2));
      }
      return rows;
    }
    return displayedCatalog;
  }, [displayedCatalog, viewMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Explore</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsServerSearchOpen((prev) => {
                const next = !prev;
                if (!next) {
                  setQuery('');
                  if (selectedServer) {
                    fetchServerCatalog(selectedServer, '');
                  }
                }
                return next;
              });
            }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isServerSearchOpen ? colors.surface : colors.canvas,
                borderColor: isServerSearchOpen ? colors.accent : colors.border,
              },
            ]}
            accessible={true}
            accessibilityLabel="Search OPDS Feeds"
          >
            <Search
              size={18}
              color={isServerSearchOpen ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky OPDS Server Hub Toolbar */}
      <View
        style={[
          styles.stickyServerHubContainer,
          {
            backgroundColor: colors.canvas,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ServerHub
          serverCategory={serverCategory}
          selectedServer={selectedServer}
          visibleServers={visibleServers}
          isServerSearchOpen={isServerSearchOpen}
          searchQuery={query}
          catalogError={catalogError}
          onOpenCategoryDropdown={() => setIsServerDropdownOpen(true)}
          onToggleSearch={() => {
            setIsServerSearchOpen((prev) => {
              const next = !prev;
              if (!next) {
                setQuery('');
                if (selectedServer) fetchServerCatalog(selectedServer, '');
              }
              return next;
            });
          }}
          onChangeSearchQuery={setQuery}
          onSubmitSearch={() => {
            if (selectedServer) fetchServerCatalog(selectedServer, query);
          }}
          onSelectServer={(server) => setSelectedServer(server)}
          onLongPressServer={(server) => {
            const isDefault =
              DEFAULT_OPDS_SERVERS.some((d) => d.id === server.id) ||
              server.id === 'all_servers';
            if (!isDefault) handleDeleteServer(server);
          }}
          onOpenAddServer={() => setIsAddServerOpen(true)}
          onRefreshServer={() => {
            if (selectedServer) fetchServerCatalog(selectedServer, query);
          }}
        />
      </View>

      {/* Main FlatList Container */}
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
            {/* Popular Section */}
            {isDefaultExploreView && (
              <PopularBooksSection
                books={popularBooks}
                downloadingId={downloadingId}
                downloadedBookIds={downloadedBookIds}
                onDownload={handleDownload}
              />
            )}

            {/* Recommended Section */}
            {isDefaultExploreView && (
              <RecommendedBooksSection
                books={recommendedBooks}
                serverTitle={selectedServer?.title || 'server'}
                downloadingId={downloadingId}
                downloadedBookIds={downloadedBookIds}
                onDownload={handleDownload}
              />
            )}

            {/* Featured Genres Section */}
            {isDefaultExploreView && (
              <GenresSection
                onGenrePress={handleGenrePress}
                onBookPress={handleGenreBookPress}
                loadingBookId={loadingGenreBookId}
              />
            )}

            {/* Catalog Section Header */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeadingWrapper}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  {query.trim()
                    ? `SEARCH RESULTS \u00B7 ${displayedCatalog.length} AVAILABLE`
                    : serverCategory === 'custom' && customServers.length === 0
                      ? 'CUSTOM BOOK SERVERS \u00B7 0 CONNECTED'
                      : `${(selectedServer?.title || 'CATALOG').toUpperCase()} \u00B7 ${displayedCatalog.length} AVAILABLE`}
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
            const row = item as OPDSBookEntry[];
            return (
              <View style={styles.gridRow}>
                {row.map((opdsItem) => (
                  <OPDSBookCard
                    key={opdsItem.id}
                    book={opdsItem}
                    viewMode="grid"
                    isDownloading={downloadingId === opdsItem.id}
                    isAlreadyDownloaded={downloadedBookIds.includes(
                      opdsItem.title.toLowerCase().trim()
                    )}
                    onDownload={handleDownload}
                  />
                ))}
                {row.length === 1 && <View style={{ width: GRID_CARD_WIDTH }} />}
              </View>
            );
          }

          // List View Mode
          const opdsItem = item as OPDSBookEntry;
          return (
            <OPDSBookCard
              key={opdsItem.id}
              book={opdsItem}
              viewMode="list"
              isDownloading={downloadingId === opdsItem.id}
              isAlreadyDownloaded={downloadedBookIds.includes(
                opdsItem.title.toLowerCase().trim()
              )}
              onDownload={handleDownload}
            />
          );
        }}
        ListEmptyComponent={
          isLoadingCatalog ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Loading catalog...
              </Text>
            </View>
          ) : serverCategory === 'custom' && customServers.length === 0 ? (
            <View style={styles.emptyFeedContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Server size={32} color={colors.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Custom Servers
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Connect your personal Calibre library or private OPDS feed to browse and download books.
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddServerOpen(true)}
                style={[styles.emptyAddServerBtn, { backgroundColor: colors.accent }]}
                accessible={true}
                accessibilityLabel="Add Server"
              >
                <Plus
                  size={16}
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.emptyAddServerBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  Add Server
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Books Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {query.trim()
                  ? 'No results match your search query.'
                  : 'Try selecting a different OPDS feed or adding a custom server.'}
              </Text>
            </View>
          )
        }
      />

      {/* Add Custom OPDS Server Modal */}
      <AddServerModal
        visible={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
        onSave={handleSaveNewServer}
      />

      {/* Select Feed Category & Servers Modal */}
      <SelectCategoryModal
        visible={isServerDropdownOpen}
        serverCategory={serverCategory}
        customServersCount={customServers.length}
        onSelectCategory={handleSelectCategory}
        onOpenAddServer={() => setIsAddServerOpen(true)}
        onClose={() => setIsServerDropdownOpen(false)}
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
  stickyServerHubContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionHeadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
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
  emptyFeedContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyAddServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddServerBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
