import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { SearchBar } from '../../src/components/common/SearchBar';
import { Badge } from '../../src/components/common/Badge';
import { OPDSBookEntry, Book, OPDSServer } from '../../src/types';
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
import {
  getAllBooks,
  toggleBookFavorite,
  deleteBook,
  updateBookStatus,
  batchDeleteBooks,
  batchToggleFavorite,
  batchUpdateStatus,
} from '../../src/db/queries/books';
import { pickAndImportBook } from '../../src/services/storage/fileManager';
import { BookCard } from '../../src/components/library/BookCard';
import {
  Download,
  BookOpen,
  Compass,
  HardDrive,
  Plus,
  Clock,
  Search,
  Globe,
  Server,
  Trash2,
  Check,
  Lock,
  X,
  RefreshCw,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Heart,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  CheckSquare,
  Square,
  MoreVertical,
  Layers,
  Eye,
  BookMarked,
  FileText,
  Star,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';
import { formatDurationSeconds, formatRelativeDate } from '../../src/utils/time';

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

  // Active view: 'explore' (OPDS & Net Library) vs 'shelf' (Local device books)
  const [activeTab, setActiveTab] = useState<'explore' | 'shelf'>('explore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(query));

  // Shelf Filtering, Sorting, and Multi-Select States
  const [shelfStatusFilter, setShelfStatusFilter] = useState<
    'all' | 'reading' | 'unread' | 'completed' | 'favorites'
  >('all');
  const [shelfFormatFilter, setShelfFormatFilter] = useState<
    'all' | 'epub' | 'pdf' | 'comic' | 'mobi' | 'txt'
  >('all');
  const [shelfSortBy, setShelfSortBy] = useState<
    'recent_read' | 'recent_added' | 'title' | 'author' | 'progress' | 'size'
  >('recent_read');
  const [shelfSortDirection, setShelfSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [contextMenuBook, setContextMenuBook] = useState<Book | null>(null);
  const [infoModalBook, setInfoModalBook] = useState<Book | null>(null);

  // OPDS State
  const [servers, setServers] = useState<OPDSServer[]>(DEFAULT_OPDS_SERVERS);
  const [selectedServer, setSelectedServer] = useState<OPDSServer>(DEFAULT_OPDS_SERVERS[0]);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [serverCategory, setServerCategory] = useState<'default' | 'custom' | 'all'>('default');
  const [isServerSearchOpen, setIsServerSearchOpen] = useState(false);
  const [catalog, setCatalog] = useState<OPDSBookEntry[]>(CURATED_PUBLIC_DOMAIN_BOOKS);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

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
    if (activeTab !== 'explore') return [];
    if (serverCategory === 'custom' && customServers.length === 0) return [];
    return catalog;
  }, [activeTab, serverCategory, customServers.length, catalog]);

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

  // Add OPDS Server Modal State
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [newServerTitle, setNewServerTitle] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerUsername, setNewServerUsername] = useState('');
  const [newServerPassword, setNewServerPassword] = useState('');
  const [isSavingServer, setIsSavingServer] = useState(false);

  // Local Device Books State
  const [deviceBooks, setDeviceBooks] = useState<Book[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [isLoadingDevice, setIsLoadingDevice] = useState(false);

  // Load OPDS Servers on Mount
  const loadServers = useCallback(async () => {
    try {
      const list = await getAllOPDSServers();
      setServers(list);
      if (list.length > 0 && !selectedServer) {
        setSelectedServer(list[0]);
      }
    } catch (e) {
      console.warn('Failed to load OPDS servers:', e);
    }
  }, [selectedServer]);

  // Load Device Books from SQLite
  const loadDeviceBooks = useCallback(async () => {
    try {
      setIsLoadingDevice(true);
      const books = await getAllBooks();
      setDeviceBooks(books);
      setDownloadedBookIds(books.map((b) => b.title.toLowerCase().trim()));
    } catch (e) {
      console.warn('Failed to load device books in explore:', e);
    } finally {
      setIsLoadingDevice(false);
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
    if (activeTab === 'explore' && selectedServer) {
      fetchServerCatalog(selectedServer, query);
    }
  }, [selectedServer, activeTab, query]);

  // Handle Download and Ingest into SQLite
  const handleDownload = async (book: OPDSBookEntry) => {
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
  };

  // Handle Save New OPDS Server
  const handleSaveNewServer = async () => {
    if (!newServerTitle.trim() || !newServerUrl.trim()) {
      Alert.alert('Required Fields', 'Please enter both a Server Name and a valid OPDS URL.');
      return;
    }

    try {
      setIsSavingServer(true);
      const saved = await saveOPDSServer({
        title: newServerTitle.trim(),
        url: newServerUrl.trim(),
        username: newServerUsername.trim() || null,
        password: newServerPassword.trim() || null,
        icon: 'server',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const updatedList = await getAllOPDSServers();
      setServers(updatedList);
      setSelectedServer(saved);
      setServerCategory('custom');
      setIsAddServerOpen(false);

      // Reset form
      setNewServerTitle('');
      setNewUrl('');
      setNewServerUsername('');
      setNewServerPassword('');

      fetchServerCatalog(saved);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save OPDS server.');
    } finally {
      setIsSavingServer(false);
    }
  };

  const setNewUrl = (val: string) => {
    setNewServerUrl(val);
  };

  // Handle Delete Custom OPDS Server
  const handleDeleteServer = (server: OPDSServer) => {
    Alert.alert(
      'Remove OPDS Server',
      `Are you sure you want to remove "${server.title}" from your OPDS feeds?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteOPDSServer(server.id);
            const list = await getAllOPDSServers();
            setServers(list);

            if (serverCategory === 'custom') {
              const remainingCustom = list.filter(
                (s) => !DEFAULT_OPDS_SERVERS.some((d) => d.id === s.id)
              );
              if (remainingCustom.length > 0) {
                setSelectedServer(remainingCustom[0]);
                fetchServerCatalog(remainingCustom[0]);
              } else {
                setSelectedServer(null as any);
                setCatalog([]);
              }
            } else if (list.length > 0) {
              setSelectedServer(list[0]);
              fetchServerCatalog(list[0]);
            }
          },
        },
      ]
    );
  };

  // Handle Local File Import
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

  // Shelf Statistics Breakdown
  const shelfStats = useMemo(() => {
    let reading = 0;
    let completed = 0;
    let unread = 0;
    let favorites = 0;
    let totalSizeBytes = 0;

    for (const b of deviceBooks) {
      const progress = b.progressPercentage || 0;
      if (b.isFavorite) favorites++;
      if (progress >= 99.5 || b.status === 'finished') {
        completed++;
      } else if (progress > 0 || b.status === 'reading') {
        reading++;
      } else {
        unread++;
      }
      if (b.fileSizeBytes) {
        totalSizeBytes += b.fileSizeBytes;
      }
    }

    const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    const totalSizeFormatted =
      totalSizeBytes > 0 ? `${totalMb} MB` : `${(deviceBooks.length * 1.8).toFixed(1)} MB`;

    return {
      total: deviceBooks.length,
      reading,
      completed,
      unread,
      favorites,
      totalSizeFormatted,
    };
  }, [deviceBooks]);

  // Filtered & Sorted Device Books for Shelf View
  const filteredDeviceBooks = useMemo(() => {
    let list = [...deviceBooks];

    // Search query filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.authors && b.authors.some((a) => a.name.toLowerCase().includes(q))) ||
          b.fileFormat?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (shelfStatusFilter === 'reading') {
      list = list.filter(
        (b) =>
          ((b.progressPercentage || 0) > 0 && (b.progressPercentage || 0) < 99.5) ||
          b.status === 'reading'
      );
    } else if (shelfStatusFilter === 'unread') {
      list = list.filter(
        (b) =>
          ((b.progressPercentage || 0) === 0 || !b.progressPercentage) &&
          b.status !== 'finished'
      );
    } else if (shelfStatusFilter === 'completed') {
      list = list.filter(
        (b) => (b.progressPercentage || 0) >= 99.5 || b.status === 'finished'
      );
    } else if (shelfStatusFilter === 'favorites') {
      list = list.filter((b) => Boolean(b.isFavorite));
    }

    // Format filter
    if (shelfFormatFilter === 'epub') {
      list = list.filter((b) => b.fileFormat?.toLowerCase() === 'epub');
    } else if (shelfFormatFilter === 'pdf') {
      list = list.filter((b) => b.fileFormat?.toLowerCase() === 'pdf');
    } else if (shelfFormatFilter === 'comic') {
      list = list.filter((b) => ['cbz', 'cbr'].includes(b.fileFormat?.toLowerCase()));
    } else if (shelfFormatFilter === 'mobi') {
      list = list.filter((b) => ['mobi', 'fb2'].includes(b.fileFormat?.toLowerCase()));
    } else if (shelfFormatFilter === 'txt') {
      list = list.filter((b) => ['txt', 'docx'].includes(b.fileFormat?.toLowerCase()));
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (shelfSortBy === 'recent_read') {
        const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
        const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (shelfSortBy === 'recent_added') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (shelfSortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (shelfSortBy === 'author') {
        const authorA = a.authors?.[0]?.name || '';
        const authorB = b.authors?.[0]?.name || '';
        comparison = authorA.localeCompare(authorB);
      } else if (shelfSortBy === 'progress') {
        comparison = (a.progressPercentage || 0) - (b.progressPercentage || 0);
      } else if (shelfSortBy === 'size') {
        comparison = (a.fileSizeBytes || 0) - (b.fileSizeBytes || 0);
      }

      return shelfSortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [
    deviceBooks,
    query,
    shelfStatusFilter,
    shelfFormatFilter,
    shelfSortBy,
    shelfSortDirection,
  ]);

  // Multi-Select Handlers
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

  const handleBatchToggleFavorite = async () => {
    if (selectedBookIds.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const shouldFavorite = selectedBookIds.some(
      (id) => !deviceBooks.find((b) => b.id === id)?.isFavorite
    );
    await batchToggleFavorite(selectedBookIds, shouldFavorite);
    await loadDeviceBooks();
  };

  const handleBatchMarkStatus = async (status: 'unread' | 'reading' | 'finished') => {
    if (selectedBookIds.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await batchUpdateStatus(selectedBookIds, status);
    await loadDeviceBooks();
  };

  const handleBatchDelete = () => {
    if (selectedBookIds.length === 0) return;
    Alert.alert(
      'Delete Books',
      `Are you sure you want to delete ${selectedBookIds.length} ${
        selectedBookIds.length === 1 ? 'book' : 'books'
      } from your device? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            await batchDeleteBooks(selectedBookIds);
            setSelectedBookIds([]);
            setIsSelectMode(false);
            await loadDeviceBooks();
          },
        },
      ]
    );
  };

  // Single Book Context Menu Handlers
  const handleToggleFavoriteSingle = async (book: Book) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await toggleBookFavorite(book.id, Boolean(book.isFavorite));
    setContextMenuBook(null);
    await loadDeviceBooks();
  };

  const handleUpdateStatusSingle = async (
    book: Book,
    status: 'unread' | 'reading' | 'finished'
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await updateBookStatus(book.id, status);
    setContextMenuBook(null);
    await loadDeviceBooks();
  };

  const handleDeleteBookSingle = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}" from your device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            await deleteBook(book.id);
            setContextMenuBook(null);
            await loadDeviceBooks();
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

  const isDefaultExploreView =
    activeTab === 'explore' && serverCategory === 'default' && !query.trim();

  // Unified FlatList data source
  const flatListData = useMemo(() => {
    if (activeTab === 'shelf') return filteredDeviceBooks;
    if (query.trim()) return displayedCatalog;
    if (serverCategory === 'default') return deviceBooks;
    if (serverCategory === 'custom' && customServers.length === 0) return [];
    return displayedCatalog;
  }, [
    activeTab,
    filteredDeviceBooks,
    query,
    displayedCatalog,
    serverCategory,
    deviceBooks,
    customServers.length,
  ]);

  // Chunked data for persistent single-column FlatList (avoids full unmount / scroll reset when toggling viewMode)
  const renderedListData = useMemo(() => {
    if (viewMode === 'grid') {
      const rows: any[][] = [];
      for (let i = 0; i < flatListData.length; i += 2) {
        rows.push(flatListData.slice(i, i + 2));
      }
      return rows;
    }
    return flatListData;
  }, [flatListData, viewMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header — matches Settings / Stats / Library design language */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Library</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              if (activeTab === 'explore') {
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
              } else {
                setIsSearchOpen((prev) => {
                  const next = !prev;
                  if (!next) {
                    setQuery('');
                  }
                  return next;
                });
              }
            }}
            style={[
              styles.iconBtn,
              {
                backgroundColor:
                  (activeTab === 'explore' ? isServerSearchOpen : isSearchOpen)
                    ? colors.surface
                    : colors.canvas,
                borderColor:
                  (activeTab === 'explore' ? isServerSearchOpen : isSearchOpen)
                    ? colors.accent
                    : colors.border,
              },
            ]}
            accessible={true}
            accessibilityLabel="Search"
          >
            <Search
              size={18}
              color={
                (activeTab === 'explore' ? isServerSearchOpen : isSearchOpen)
                  ? colors.accent
                  : colors.textPrimary
              }
            />
          </TouchableOpacity>

          {activeTab === 'explore' ? (
            <TouchableOpacity
              onPress={() => setIsAddServerOpen(true)}
              style={[styles.importIconBtn, { backgroundColor: colors.accent }]}
              accessible={true}
              accessibilityLabel="Add OPDS Feed"
            >
              <Plus size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleImport}
              style={[styles.importIconBtn, { backgroundColor: colors.accent }]}
              accessible={true}
              accessibilityLabel="Import Local Book"
            >
              <Plus size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
            </TouchableOpacity>
          )}
        </View>
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
            {/* View Switcher Toggle (Explore / Net Library vs Device Shelf) */}
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
                  accessibilityLabel="Explore OPDS & Net Library"
                >
                  <Globe
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
                  }}
                  accessible={true}
                  accessibilityLabel="View Device Books Shelf"
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

            {/* Collapsible Search Query Bar for Shelf Mode */}
            {activeTab === 'shelf' && isSearchOpen && (
              <View style={styles.searchBarWrapper}>
                <SearchBar
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search books on your device..."
                  autoFocus={true}
                />
              </View>
            )}

            {/* Shelf Dashboard Controls (Stats, Filter Pills, Sort & Multi-Select) */}
            {activeTab === 'shelf' && (
              <View style={styles.shelfDashboardContainer}>
                {/* 1. Shelf Summary Banner */}
                <View
                  style={[
                    styles.shelfSummaryBanner,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.shelfSummaryLeft}>
                    <View style={styles.shelfStatCountBadge}>
                      <HardDrive size={13} color={colors.accent} style={{ marginRight: 5 }} />
                      <Text style={[styles.shelfStatCountText, { color: colors.textPrimary }]}>
                        {shelfStats.total} {shelfStats.total === 1 ? 'Book' : 'Books'}
                      </Text>
                    </View>
                    <Text style={[styles.shelfStatDetails, { color: colors.textSecondary }]}>
                      {shelfStats.reading > 0 ? `${shelfStats.reading} Reading \u00B7 ` : ''}
                      {shelfStats.completed > 0 ? `${shelfStats.completed} Finished \u00B7 ` : ''}
                      {shelfStats.totalSizeFormatted}
                    </Text>
                  </View>

                  <View style={styles.shelfSummaryRightActions}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setIsSelectMode((prev) => {
                          if (prev) setSelectedBookIds([]);
                          return !prev;
                        });
                      }}
                      style={[
                        styles.shelfActionBtn,
                        {
                          backgroundColor: isSelectMode ? colors.accent : colors.surface,
                          borderColor: isSelectMode ? colors.accent : colors.border,
                        },
                      ]}
                      accessible={true}
                      accessibilityLabel="Multi-select mode"
                    >
                      <CheckSquare
                        size={13}
                        color={
                          isSelectMode
                            ? colors.isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textPrimary
                        }
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.shelfActionBtnText,
                          {
                            color: isSelectMode
                              ? colors.isDark
                                ? '#000000'
                                : '#FFFFFF'
                              : colors.textPrimary,
                            fontFamily: isSelectMode ? FONTS.mona.bold : FONTS.mona.medium,
                          },
                        ]}
                      >
                        {isSelectMode ? 'Cancel' : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Multi-Select Action Bar (Active when isSelectMode === true) */}
                {isSelectMode && (
                  <View
                    style={[
                      styles.batchActionBar,
                      { backgroundColor: colors.surface, borderColor: colors.accent },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={handleSelectAll}
                      style={styles.batchSelectAllBtn}
                    >
                      <Text style={[styles.batchSelectAllText, { color: colors.textPrimary }]}>
                        {selectedBookIds.length === filteredDeviceBooks.length &&
                        filteredDeviceBooks.length > 0
                          ? 'Deselect All'
                          : `Select All (${selectedBookIds.length}/${filteredDeviceBooks.length})`}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.batchActionIconsRow}>
                      <TouchableOpacity
                        onPress={handleBatchToggleFavorite}
                        disabled={selectedBookIds.length === 0}
                        style={[
                          styles.batchMiniActionBtn,
                          { opacity: selectedBookIds.length === 0 ? 0.35 : 1 },
                        ]}
                        accessible={true}
                        accessibilityLabel="Favorite selected"
                      >
                        <Heart size={15} color={colors.accent} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleBatchMarkStatus('finished')}
                        disabled={selectedBookIds.length === 0}
                        style={[
                          styles.batchMiniActionBtn,
                          { opacity: selectedBookIds.length === 0 ? 0.35 : 1 },
                        ]}
                        accessible={true}
                        accessibilityLabel="Mark selected finished"
                      >
                        <CheckCircle2 size={15} color={colors.accent} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleBatchDelete}
                        disabled={selectedBookIds.length === 0}
                        style={[
                          styles.batchMiniActionBtn,
                          { opacity: selectedBookIds.length === 0 ? 0.35 : 1 },
                        ]}
                        accessible={true}
                        accessibilityLabel="Delete selected"
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* 2. Status Filter Pills */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelfFilterChipsScroll}
                >
                  {[
                    { key: 'all', label: 'All', count: shelfStats.total },
                    { key: 'reading', label: 'Reading', count: shelfStats.reading },
                    { key: 'unread', label: 'Unread', count: shelfStats.unread },
                    { key: 'completed', label: 'Finished', count: shelfStats.completed },
                    { key: 'favorites', label: 'Favorites', count: shelfStats.favorites },
                  ].map((tab) => {
                    const isSelected = shelfStatusFilter === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setShelfStatusFilter(tab.key as any);
                        }}
                        style={[
                          styles.shelfFilterChip,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.surface,
                            borderColor: isSelected ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.shelfFilterChipText,
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
                          {tab.label}
                        </Text>
                        <View
                          style={[
                            styles.shelfFilterCountPill,
                            {
                              backgroundColor: isSelected
                                ? colors.isDark
                                  ? 'rgba(0,0,0,0.18)'
                                  : 'rgba(255,255,255,0.25)'
                                : colors.canvas,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.shelfFilterCountText,
                              {
                                color: isSelected
                                  ? colors.isDark
                                    ? '#000000'
                                    : '#FFFFFF'
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {tab.count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 3. Format Filter Pills & Sort Row */}
                <View style={styles.shelfFormatAndSortRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.shelfFormatScroll}
                  >
                    {[
                      { key: 'all', label: 'All Formats' },
                      { key: 'epub', label: 'EPUB' },
                      { key: 'pdf', label: 'PDF' },
                      { key: 'comic', label: 'Comics' },
                      { key: 'mobi', label: 'MOBI/FB2' },
                      { key: 'txt', label: 'TXT' },
                    ].map((fmt) => {
                      const isSelected = shelfFormatFilter === fmt.key;
                      return (
                        <TouchableOpacity
                          key={fmt.key}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setShelfFormatFilter(fmt.key as any);
                          }}
                          style={[
                            styles.shelfFormatChip,
                            {
                              backgroundColor: isSelected ? colors.surface : 'transparent',
                              borderColor: isSelected ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.shelfFormatChipText,
                              {
                                color: isSelected ? colors.accent : colors.textSecondary,
                                fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.regular,
                              },
                            ]}
                          >
                            {fmt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Sort Trigger Button & Sort Direction Toggle */}
                  <View style={styles.shelfSortActionsGroup}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setIsSortModalOpen(true);
                      }}
                      style={[
                        styles.shelfSortBtn,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      accessible={true}
                      accessibilityLabel="Sort options"
                    >
                      <ArrowUpDown size={11} color={colors.accent} style={{ marginRight: 4 }} />
                      <Text
                        style={[styles.shelfSortBtnText, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {shelfSortBy === 'recent_read'
                          ? 'Recent'
                          : shelfSortBy === 'recent_added'
                            ? 'Added'
                            : shelfSortBy === 'title'
                              ? 'Title'
                              : shelfSortBy === 'author'
                                ? 'Author'
                                : shelfSortBy === 'progress'
                                  ? 'Progress'
                                  : 'Size'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setShelfSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                      style={[
                        styles.shelfSortDirBtn,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      accessible={true}
                      accessibilityLabel={`Sort direction: ${shelfSortDirection === 'asc' ? 'ascending' : 'descending'}`}
                    >
                      {shelfSortDirection === 'asc' ? (
                        <ArrowUp size={12} color={colors.textPrimary} />
                      ) : (
                        <ArrowDown size={12} color={colors.textPrimary} />
                      )}
                    </TouchableOpacity>

                    {(shelfStatusFilter !== 'all' ||
                      shelfFormatFilter !== 'all' ||
                      shelfSortBy !== 'recent_read' ||
                      query.trim()) && (
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setShelfStatusFilter('all');
                          setShelfFormatFilter('all');
                          setShelfSortBy('recent_read');
                          setShelfSortDirection('desc');
                          setQuery('');
                        }}
                        style={[
                          styles.shelfResetBtn,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                        accessible={true}
                        accessibilityLabel="Reset all filters"
                      >
                        <RotateCcw size={11} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* OPDS Server Hub Horizontal Scroll Bar (Only in Explore Mode) */}
            {activeTab === 'explore' && (
              <View style={styles.serverHubContainer}>
                <View style={styles.serverHubHeader}>
                  {/* Feed Category Dropdown Button on the Left */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setIsServerDropdownOpen(true);
                    }}
                    style={[
                      styles.serverDropdownBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    accessible={true}
                    accessibilityLabel="Select Feed Category"
                  >
                    <Globe size={13} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text
                      style={[styles.serverDropdownBtnText, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {serverCategory === 'default'
                        ? 'Default Servers'
                        : serverCategory === 'custom'
                          ? 'Custom Servers'
                          : 'All Servers'}
                    </Text>
                    <ChevronDown size={13} color={colors.textSecondary} style={{ marginLeft: 5 }} />
                  </TouchableOpacity>

                  {/* Search Button on the Right to toggle search bar */}
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
                      styles.serverSearchToggleBtn,
                      {
                        backgroundColor: isServerSearchOpen ? colors.surface : colors.surface,
                        borderColor: isServerSearchOpen ? colors.accent : colors.border,
                      },
                    ]}
                    accessible={true}
                    accessibilityLabel="Toggle Server Search"
                  >
                    <Search
                      size={14}
                      color={isServerSearchOpen ? colors.accent : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {visibleServers.length === 0 ? (
                  <View
                    style={[
                      styles.noServersPillContainer,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.noServersPillText, { color: colors.textSecondary }]}>
                      No custom servers added yet.
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsAddServerOpen(true)}
                      style={[styles.inlineAddFeedBtn, { backgroundColor: colors.accent }]}
                    >
                      <Plus
                        size={12}
                        color={colors.isDark ? '#000000' : '#FFFFFF'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.inlineAddFeedText,
                          { color: colors.isDark ? '#000000' : '#FFFFFF' },
                        ]}
                      >
                        Add Feed
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.serverPillsScroll}
                  >
                    {visibleServers.map((server) => {
                      const isSelected = selectedServer?.id === server.id;
                      const isDefault =
                        DEFAULT_OPDS_SERVERS.some((d) => d.id === server.id) ||
                        server.id === 'all_servers';

                      return (
                        <TouchableOpacity
                          key={server.id}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setSelectedServer(server);
                          }}
                          onLongPress={() => {
                            if (!isDefault) {
                              handleDeleteServer(server);
                            }
                          }}
                          style={[
                            styles.serverPill,
                            {
                              backgroundColor: isSelected ? colors.accent : colors.surface,
                              borderColor: isSelected ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Server
                            size={13}
                            color={
                              isSelected
                                ? colors.isDark
                                  ? '#000000'
                                  : '#FFFFFF'
                                : colors.textSecondary
                            }
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.serverPillText,
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
                            {server.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Server Search Bar to Search Books in Selected Server (Toggled via search button) */}
                {isServerSearchOpen && selectedServer && (
                  <View
                    style={[
                      styles.serverSearchBar,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Search
                      size={15}
                      color={colors.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      placeholder={`Search in ${selectedServer.title}...`}
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.serverSearchInput, { color: colors.textPrimary }]}
                      autoCorrect={false}
                      autoCapitalize="none"
                      autoFocus={true}
                      returnKeyType="search"
                      onSubmitEditing={() => fetchServerCatalog(selectedServer, query)}
                    />
                    {query.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setQuery('');
                          fetchServerCatalog(selectedServer, '');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.clearBtn}
                        accessible={true}
                        accessibilityLabel="Clear Search"
                      >
                        <X size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        fetchServerCatalog(selectedServer, query);
                      }}
                      style={styles.refreshBtn}
                      accessible={true}
                      accessibilityLabel={`Refresh ${selectedServer.title} Catalog`}
                    >
                      <RefreshCw size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Error Banner if remote OPDS failed */}
                {catalogError && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>
                      Feed connection failed. Displaying curated public domain catalog.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* When in Default Servers Explore mode and not searching: render Popular & Recommended sections */}
            {isDefaultExploreView && (
              <>
                {/* Section 1: Popular (4 popular books from server not on device) */}
                {popularBooks.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeadingWrapper}>
                      <View style={styles.sectionHeadingLeft}>
                        <Sparkles size={16} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.sectionHeadingTitle, { color: colors.textPrimary }]}>
                          Popular
                        </Text>
                      </View>
                      <Text style={[styles.sectionHeadingSubtitle, { color: colors.textSecondary }]}>
                        Top picks not on device
                      </Text>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.popularScrollContent}
                    >
                      {popularBooks.map((book, index) => {
                        const isDownloading = downloadingId === book.id;
                        const isAlreadyDownloaded = downloadedBookIds.includes(
                          book.title.toLowerCase().trim()
                        );

                        return (
                          <View
                            key={book.id}
                            style={[
                              styles.popularCard,
                              { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.popularCoverWrapper,
                                { backgroundColor: colors.canvas, borderColor: colors.border },
                              ]}
                            >
                              {book.coverUrl ? (
                                <Image
                                  source={{ uri: book.coverUrl }}
                                  style={styles.popularCoverImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.popularPlaceholderCover,
                                    { backgroundColor: colors.accent },
                                  ]}
                                >
                                  <BookOpen
                                    size={28}
                                    color={colors.isDark ? '#000000' : '#FFFFFF'}
                                  />
                                  <Text
                                    style={[
                                      styles.popularPlaceholderTitle,
                                      { color: colors.isDark ? '#000000' : '#FFFFFF' },
                                    ]}
                                    numberOfLines={3}
                                  >
                                    {book.title}
                                  </Text>
                                </View>
                              )}

                              {/* Popular Rank Badge */}
                              <View
                                style={[
                                  styles.popularRankBadge,
                                  {
                                    backgroundColor: colors.isDark
                                      ? 'rgba(0, 0, 0, 0.75)'
                                      : 'rgba(255, 255, 255, 0.9)',
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Sparkles
                                  size={10}
                                  color={colors.accent}
                                  style={{ marginRight: 3 }}
                                />
                                <Text
                                  style={[
                                    styles.popularRankText,
                                    { color: colors.textPrimary },
                                  ]}
                                >
                                  #{index + 1}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.popularInfo}>
                              <Text
                                style={[styles.popularBookTitle, { color: colors.textPrimary }]}
                                numberOfLines={2}
                              >
                                {book.title}
                              </Text>
                              <Text
                                style={[styles.popularBookAuthor, { color: colors.textSecondary }]}
                                numberOfLines={1}
                              >
                                {book.author || 'Classic'}
                              </Text>

                              <View style={styles.popularFooterRow}>
                                <Badge
                                  label={book.fileFormat?.toUpperCase() || 'EPUB'}
                                  variant="secondary"
                                />

                                <TouchableOpacity
                                  onPress={() => handleDownload(book)}
                                  disabled={isDownloading || isAlreadyDownloaded}
                                  style={[
                                    styles.popularDownloadBtn,
                                    {
                                      backgroundColor: isAlreadyDownloaded
                                        ? 'transparent'
                                        : colors.accent,
                                      borderColor: isAlreadyDownloaded
                                        ? colors.border
                                        : colors.accent,
                                    },
                                  ]}
                                  accessible={true}
                                  accessibilityLabel={
                                    isAlreadyDownloaded ? 'In Library' : `Get ${book.title}`
                                  }
                                >
                                  {isDownloading ? (
                                    <ActivityIndicator
                                      size="small"
                                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                                    />
                                  ) : isAlreadyDownloaded ? (
                                    <>
                                      <Check
                                        size={11}
                                        color={colors.textSecondary}
                                        style={{ marginRight: 3 }}
                                      />
                                      <Text
                                        style={[
                                          styles.popularDownloadBtnText,
                                          { color: colors.textSecondary },
                                        ]}
                                      >
                                        Saved
                                      </Text>
                                    </>
                                  ) : (
                                    <>
                                      <Download
                                        size={11}
                                        color={colors.isDark ? '#000000' : '#FFFFFF'}
                                        style={{ marginRight: 3 }}
                                      />
                                      <Text
                                        style={[
                                          styles.popularDownloadBtnText,
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
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Section 2: Recommended (6 recommended books from server not on device) */}
                {recommendedBooks.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeadingWrapper}>
                      <View style={styles.sectionHeadingLeft}>
                        <Compass size={16} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.sectionHeadingTitle, { color: colors.textPrimary }]}>
                          Recommended
                        </Text>
                      </View>
                      <Text style={[styles.sectionHeadingSubtitle, { color: colors.textSecondary }]}>
                        Curated from {selectedServer?.title || 'server'}
                      </Text>
                    </View>

                  <View style={styles.recommendedList}>
                    {recommendedBooks.map((book) => {
                      const isDownloading = downloadingId === book.id;
                      const isAlreadyDownloaded = downloadedBookIds.includes(
                        book.title.toLowerCase().trim()
                      );

                      return (
                        <View
                          key={book.id}
                          style={[
                            styles.card,
                            styles.recommendedCard,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                          ]}
                        >
                          <View style={[styles.coverWrapper, { backgroundColor: colors.canvas }]}>
                            {book.coverUrl ? (
                              <Image
                                source={{ uri: book.coverUrl }}
                                style={styles.coverImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                style={[
                                  styles.placeholderCover,
                                  { backgroundColor: colors.accent },
                                ]}
                              >
                                <BookOpen
                                  size={24}
                                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                                />
                              </View>
                            )}
                          </View>

                          <View style={styles.infoWrapper}>
                            <View style={styles.titleRow}>
                              <Text
                                style={[styles.bookTitle, { color: colors.textPrimary }]}
                                numberOfLines={2}
                              >
                                {book.title}
                              </Text>
                            </View>

                            <Text
                              style={[styles.bookAuthor, { color: colors.textSecondary }]}
                              numberOfLines={1}
                            >
                              {book.author || 'Public Domain Classic'}
                            </Text>

                            {book.summary ? (
                              <Text
                                style={[styles.bookSummary, { color: colors.textSecondary }]}
                                numberOfLines={2}
                              >
                                {book.summary}
                              </Text>
                            ) : null}

                            <View style={styles.cardFooter}>
                              <Badge
                                label={book.fileFormat?.toUpperCase() || 'EPUB'}
                                variant="secondary"
                              />

                              <TouchableOpacity
                                onPress={() => handleDownload(book)}
                                disabled={isDownloading || isAlreadyDownloaded}
                                style={[
                                  styles.downloadBtn,
                                  {
                                    backgroundColor: isAlreadyDownloaded
                                      ? 'transparent'
                                      : colors.accent,
                                    borderColor: isAlreadyDownloaded
                                      ? colors.border
                                      : colors.accent,
                                  },
                                ]}
                                accessible={true}
                                accessibilityLabel={
                                  isAlreadyDownloaded
                                    ? 'In Library'
                                    : `Download ${book.title}`
                                }
                              >
                                {isDownloading ? (
                                  <ActivityIndicator
                                    size="small"
                                    color={colors.isDark ? '#000000' : '#FFFFFF'}
                                  />
                                ) : isAlreadyDownloaded ? (
                                  <>
                                    <Check
                                      size={14}
                                      color={colors.textSecondary}
                                      style={{ marginRight: 4 }}
                                    />
                                    <Text
                                      style={[
                                        styles.downloadBtnText,
                                        { color: colors.textSecondary },
                                      ]}
                                    >
                                      In Library
                                    </Text>
                                  </>
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
                                        {
                                          color: colors.isDark ? '#000000' : '#FFFFFF',
                                          fontFamily: FONTS.mona.bold,
                                        },
                                      ]}
                                    >
                                      Get Book
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}

            {/* Section Heading */}
            <View style={styles.sectionHeaderRow}>
              {isDefaultExploreView || activeTab === 'shelf' ? (
                <View style={styles.sectionHeadingWrapper}>
                  <View style={styles.sectionHeadingLeft}>
                    <HardDrive size={16} color={colors.accent} style={{ marginRight: 6 }} />
                    <Text style={[styles.sectionHeadingTitle, { color: colors.textPrimary }]}>
                      {activeTab === 'shelf' ? 'Device Shelf' : 'On Device'}
                    </Text>
                  </View>
                  <View style={styles.sectionHeadingRightActions}>
                    <Text style={[styles.sectionHeadingBadge, { color: colors.textSecondary }]}>
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
              ) : (
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
              )}
            </View>

            {isDefaultExploreView && deviceBooks.length === 0 && (
              <View
                style={[
                  styles.emptyInstalledCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <BookOpen size={24} color={colors.accent} style={{ marginBottom: 6 }} />
                <Text style={[styles.emptyInstalledTitle, { color: colors.textPrimary }]}>
                  No Books on Device Yet
                </Text>
                <Text style={[styles.emptyInstalledSubtitle, { color: colors.textSecondary }]}>
                  Tap "Get" on any popular or recommended title above to download it to your device.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          if (viewMode === 'grid') {
            const row = item as any[];
            if (isDefaultExploreView || activeTab === 'shelf') {
              return (
                <View style={styles.gridRow}>
                  {row.map((shelfBook: Book) => (
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

            // OPDS Grid Row
            return (
              <View style={styles.gridRow}>
                {row.map((opdsItem: OPDSBookEntry) => {
                  const isDownloading = downloadingId === opdsItem.id;
                  const isAlreadyDownloaded = downloadedBookIds.includes(
                    opdsItem.title.toLowerCase().trim()
                  );

                  return (
                    <View
                      key={opdsItem.id}
                      style={[styles.gridContainer, { width: GRID_CARD_WIDTH }]}
                    >
                      <View
                        style={[
                          styles.gridCoverWrapper,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        {opdsItem.coverUrl ? (
                          <Image
                            source={{ uri: opdsItem.coverUrl }}
                            style={styles.gridCoverImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.gridPlaceholderCover,
                              { backgroundColor: colors.accent },
                            ]}
                          >
                            <BookOpen
                              size={32}
                              color={colors.isDark ? '#000000' : '#FFFFFF'}
                            />
                            <Text
                              style={[
                                styles.gridPlaceholderTitle,
                                { color: colors.isDark ? '#000000' : '#FFFFFF' },
                              ]}
                              numberOfLines={3}
                            >
                              {opdsItem.title}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.gridInfo}>
                        <Text
                          style={[styles.gridTitle, { color: colors.textPrimary }]}
                          numberOfLines={2}
                        >
                          {opdsItem.title}
                        </Text>
                        <Text
                          style={[styles.gridAuthor, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {opdsItem.author || 'Public Domain'}
                        </Text>

                        <View style={styles.gridFooterRow}>
                          <Badge
                            label={opdsItem.fileFormat?.toUpperCase() || 'EPUB'}
                            variant="secondary"
                          />

                          <TouchableOpacity
                            onPress={() => handleDownload(opdsItem)}
                            disabled={isDownloading || isAlreadyDownloaded}
                            style={[
                              styles.gridDownloadBtn,
                              {
                                backgroundColor: isAlreadyDownloaded
                                  ? 'transparent'
                                  : colors.accent,
                                borderColor: isAlreadyDownloaded
                                  ? colors.border
                                  : colors.accent,
                              },
                            ]}
                            accessible={true}
                            accessibilityLabel={
                              isAlreadyDownloaded
                                ? 'In Library'
                                : `Get ${opdsItem.title}`
                            }
                          >
                            {isDownloading ? (
                              <ActivityIndicator
                                size="small"
                                color={colors.isDark ? '#000000' : '#FFFFFF'}
                              />
                            ) : isAlreadyDownloaded ? (
                              <>
                                <Check
                                  size={11}
                                  color={colors.textSecondary}
                                  style={{ marginRight: 3 }}
                                />
                                <Text
                                  style={[
                                    styles.gridDownloadBtnText,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  Saved
                                </Text>
                              </>
                            ) : (
                              <>
                                <Download
                                  size={11}
                                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                                  style={{ marginRight: 3 }}
                                />
                                <Text
                                  style={[
                                    styles.gridDownloadBtnText,
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
                })}
                {row.length === 1 && <View style={{ width: GRID_CARD_WIDTH }} />}
              </View>
            );
          }

          // List View Mode
          if (isDefaultExploreView || activeTab === 'shelf') {
            const shelfBook = item as Book;

            return (
              <BookCard
                key={shelfBook.id}
                book={shelfBook}
                viewMode="list"
                isSelectMode={isSelectMode}
                isSelected={selectedBookIds.includes(shelfBook.id)}
                onSelect={() => handleToggleSelectBook(shelfBook.id)}
                onPress={() => router.push(`/reader/${shelfBook.id}` as any)}
                onLongPress={() => setContextMenuBook(shelfBook)}
              />
            );
          }

          // Explore / OPDS Book Item (Search mode, Custom server mode, All server mode)
          const opdsItem = item as unknown as OPDSBookEntry;
          const isDownloading = downloadingId === opdsItem.id;
          const isAlreadyDownloaded = downloadedBookIds.includes(
            opdsItem.title.toLowerCase().trim()
          );

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.coverWrapper, { backgroundColor: colors.canvas }]}>
                {opdsItem.coverUrl ? (
                  <Image
                    source={{ uri: opdsItem.coverUrl }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.placeholderCover,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <BookOpen
                      size={24}
                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                    />
                  </View>
                )}
              </View>

              <View style={styles.infoWrapper}>
                <View style={styles.titleRow}>
                  <Text
                    style={[styles.bookTitle, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {opdsItem.title}
                  </Text>
                </View>

                <Text
                  style={[styles.bookAuthor, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {opdsItem.author || 'Public Domain Classic'}
                </Text>

                {opdsItem.summary ? (
                  <Text
                    style={[styles.bookSummary, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {opdsItem.summary}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.badgeRow}>
                    <Badge
                      label={opdsItem.fileFormat?.toUpperCase() || 'EPUB'}
                      variant="secondary"
                    />
                    {opdsItem.published && (
                      <Text
                        style={[
                          styles.publishedDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {opdsItem.published}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDownload(opdsItem)}
                    disabled={isDownloading || isAlreadyDownloaded}
                    style={[
                      styles.downloadBtn,
                      {
                        backgroundColor: isAlreadyDownloaded
                          ? 'transparent'
                          : colors.accent,
                        borderColor: isAlreadyDownloaded
                          ? colors.border
                          : colors.accent,
                      },
                    ]}
                    accessible={true}
                    accessibilityLabel={
                      isAlreadyDownloaded
                        ? 'In Library'
                        : `Download ${opdsItem.title}`
                    }
                  >
                    {isDownloading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.isDark ? '#000000' : '#FFFFFF'}
                      />
                    ) : isAlreadyDownloaded ? (
                      <>
                        <Check
                          size={14}
                          color={colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.downloadBtnText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          In Library
                        </Text>
                      </>
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
                            {
                              color: colors.isDark ? '#000000' : '#FFFFFF',
                              fontFamily: FONTS.mona.bold,
                            },
                          ]}
                        >
                          Get Book
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoadingCatalog || isLoadingDevice ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Loading catalog...
              </Text>
            </View>
          ) : activeTab === 'shelf' ? (
            deviceBooks.length === 0 ? (
              <View style={styles.emptyFeedContainer}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <HardDrive size={32} color={colors.accent} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  Your Device Shelf is Empty
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Import EPUB, PDF, CBZ, or MOBI files from your storage or explore public domain catalogs.
                </Text>
                <TouchableOpacity
                  onPress={handleImport}
                  style={[styles.emptyAddServerBtn, { backgroundColor: colors.accent }]}
                  accessible={true}
                  accessibilityLabel="Import Book"
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
                    Import Local Book
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyFeedContainer}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Filter size={28} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No Matching Books
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No books on your device match the current filter or search criteria.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setShelfStatusFilter('all');
                    setShelfFormatFilter('all');
                    setShelfSortBy('recent_read');
                    setShelfSortDirection('desc');
                    setQuery('');
                  }}
                  style={[styles.emptyAddServerBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                  accessible={true}
                  accessibilityLabel="Reset Filters"
                >
                  <RotateCcw
                    size={15}
                    color={colors.textPrimary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.emptyAddServerBtnText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : activeTab === 'explore' &&
            serverCategory === 'custom' &&
            customServers.length === 0 ? (
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
      <Modal
        visible={isAddServerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddServerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={20} color={colors.accent} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Add OPDS / Calibre Feed
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddServerOpen(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Server Name *
              </Text>
              <TextInput
                value={newServerTitle}
                onChangeText={setNewServerTitle}
                placeholder="e.g. My Calibre Library"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                OPDS Feed URL *
              </Text>
              <TextInput
                value={newServerUrl}
                onChangeText={setNewServerUrl}
                placeholder="https://my-server.com/opds"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Username (Optional)
              </Text>
              <TextInput
                value={newServerUsername}
                onChangeText={setNewServerUsername}
                placeholder="Username if password-protected"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Password (Optional)
              </Text>
              <TextInput
                value={newServerPassword}
                onChangeText={setNewServerPassword}
                placeholder="Password if required"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={true}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
              />

              <TouchableOpacity
                onPress={handleSaveNewServer}
                disabled={isSavingServer}
                style={[styles.saveServerBtn, { backgroundColor: colors.accent }]}
              >
                {isSavingServer ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.isDark ? '#000000' : '#FFFFFF'}
                  />
                ) : (
                  <Text
                    style={[
                      styles.saveServerBtnText,
                      { color: colors.isDark ? '#000000' : '#FFFFFF' },
                    ]}
                  >
                    Save & Connect Feed
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Feed / Server Selection Dropdown Modal */}
      <Modal
        visible={isServerDropdownOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsServerDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setIsServerDropdownOpen(false)}
        >
          <View
            style={[
              styles.dropdownModalContent,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={styles.dropdownHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={18} color={colors.accent} />
                <Text style={[styles.dropdownTitle, { color: colors.textPrimary }]}>
                  Select Feed
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsServerDropdownOpen(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 3 Direct Feed Category Options */}
            <View style={styles.categoryOptionsList}>
              {/* Option 1: Default Servers */}
              <TouchableOpacity
                onPress={() => handleSelectCategory('default')}
                style={[
                  styles.dropdownCategoryItem,
                  {
                    backgroundColor:
                      serverCategory === 'default' ? colors.surface : 'transparent',
                    borderColor:
                      serverCategory === 'default' ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.dropdownServerInfo}>
                  <Globe
                    size={18}
                    color={
                      serverCategory === 'default' ? colors.accent : colors.textSecondary
                    }
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownServerTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily:
                            serverCategory === 'default'
                              ? FONTS.mona.bold
                              : FONTS.mona.medium,
                        },
                      ]}
                    >
                      Default Servers
                    </Text>
                    <Text
                      style={[styles.dropdownServerUrl, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      Curated public domain catalogs & classics
                    </Text>
                  </View>
                </View>
                {serverCategory === 'default' && (
                  <Check size={16} color={colors.accent} />
                )}
              </TouchableOpacity>

              {/* Option 2: Custom Servers */}
              <TouchableOpacity
                onPress={() => handleSelectCategory('custom')}
                style={[
                  styles.dropdownCategoryItem,
                  {
                    backgroundColor:
                      serverCategory === 'custom' ? colors.surface : 'transparent',
                    borderColor:
                      serverCategory === 'custom' ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.dropdownServerInfo}>
                  <Server
                    size={18}
                    color={
                      serverCategory === 'custom' ? colors.accent : colors.textSecondary
                    }
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownServerTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily:
                            serverCategory === 'custom'
                              ? FONTS.mona.bold
                              : FONTS.mona.medium,
                        },
                      ]}
                    >
                      Custom Servers
                    </Text>
                    <Text
                      style={[styles.dropdownServerUrl, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      Your self-hosted OPDS & Calibre feeds
                    </Text>
                  </View>
                </View>
                {serverCategory === 'custom' && (
                  <Check size={16} color={colors.accent} />
                )}
              </TouchableOpacity>

              {/* Option 3: All Servers */}
              <TouchableOpacity
                onPress={() => handleSelectCategory('all')}
                style={[
                  styles.dropdownCategoryItem,
                  {
                    backgroundColor:
                      serverCategory === 'all' ? colors.surface : 'transparent',
                    borderColor:
                      serverCategory === 'all' ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.dropdownServerInfo}>
                  <Compass
                    size={18}
                    color={
                      serverCategory === 'all' ? colors.accent : colors.textSecondary
                    }
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownServerTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily:
                            serverCategory === 'all' ? FONTS.mona.bold : FONTS.mona.medium,
                        },
                      ]}
                    >
                      All Servers
                    </Text>
                    <Text
                      style={[styles.dropdownServerUrl, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      Unified catalog across all available feeds
                    </Text>
                  </View>
                </View>
                {serverCategory === 'all' && (
                  <Check size={16} color={colors.accent} />
                )}
              </TouchableOpacity>
            </View>

            {/* Pinned Add New Custom Server CTA */}
            <TouchableOpacity
              onPress={() => {
                setIsServerDropdownOpen(false);
                setIsAddServerOpen(true);
              }}
              style={[styles.dropdownAddBtn, { backgroundColor: colors.accent }]}
            >
              <Plus
                size={15}
                color={colors.isDark ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.dropdownAddBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Add Custom Feed
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Options Modal */}
      <Modal
        visible={isSortModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSortModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortModalOpen(false)}
        >
          <View
            style={[
              styles.dropdownModalContent,
              { backgroundColor: colors.canvas, borderColor: colors.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.dropdownHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ArrowUpDown size={18} color={colors.accent} />
                <Text style={[styles.dropdownTitle, { color: colors.textPrimary }]}>
                  Sort Books By
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSortModalOpen(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryOptionsList}>
              {[
                { id: 'recent_read', label: 'Recently Read', desc: 'Sort by reading activity' },
                { id: 'recent_added', label: 'Recently Added', desc: 'Sort by import date' },
                { id: 'title', label: 'Title (A → Z)', desc: 'Alphabetical order' },
                { id: 'author', label: 'Author (A → Z)', desc: 'Author name order' },
                { id: 'progress', label: 'Reading Progress', desc: 'Highest completion percentage' },
                { id: 'size', label: 'File Size', desc: 'Largest file footprint' },
              ].map((opt) => {
                const isSelected = shelfSortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setShelfSortBy(opt.id as any);
                      setIsSortModalOpen(false);
                    }}
                    style={[
                      styles.dropdownCategoryItem,
                      {
                        backgroundColor: isSelected ? colors.surface : 'transparent',
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.dropdownServerTitle,
                          {
                            color: colors.textPrimary,
                            fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={[styles.dropdownServerUrl, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {opt.desc}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color={colors.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Book Context Menu Modal */}
      <Modal
        visible={Boolean(contextMenuBook)}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setContextMenuBook(null)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setContextMenuBook(null)}
        >
          {contextMenuBook && (
            <View
              style={[
                styles.dropdownModalContent,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Header with cover and title */}
              <View style={styles.contextBookHeader}>
                <View style={[styles.contextCoverWrapper, { backgroundColor: colors.surface }]}>
                  {contextMenuBook.coverImagePath ? (
                    <Image
                      source={{ uri: contextMenuBook.coverImagePath }}
                      style={styles.contextCoverImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <BookOpen size={20} color={colors.accent} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[styles.contextBookTitle, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {contextMenuBook.title}
                  </Text>
                  <Text
                    style={[styles.contextBookAuthor, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {contextMenuBook.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setContextMenuBook(null)}
                  style={styles.closeBtn}
                >
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.contextActionsList}>
                {/* 1. Toggle Favorite */}
                <TouchableOpacity
                  onPress={() => handleToggleFavoriteSingle(contextMenuBook)}
                  style={[styles.contextActionRow, { borderBottomColor: colors.border }]}
                >
                  <Heart
                    size={18}
                    color={contextMenuBook.isFavorite ? '#EF4444' : colors.textPrimary}
                    fill={contextMenuBook.isFavorite ? '#EF4444' : 'none'}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[styles.contextActionText, { color: colors.textPrimary }]}>
                    {contextMenuBook.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Text>
                </TouchableOpacity>

                {/* 2. Mark Finished / Reset Progress */}
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatusSingle(
                      contextMenuBook,
                      (contextMenuBook.progressPercentage || 0) >= 99.5 ? 'unread' : 'finished'
                    )
                  }
                  style={[styles.contextActionRow, { borderBottomColor: colors.border }]}
                >
                  {(contextMenuBook.progressPercentage || 0) >= 99.5 ? (
                    <RotateCcw size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
                  ) : (
                    <CheckCircle2 size={18} color={colors.accent} style={{ marginRight: 12 }} />
                  )}
                  <Text style={[styles.contextActionText, { color: colors.textPrimary }]}>
                    {(contextMenuBook.progressPercentage || 0) >= 99.5
                      ? 'Reset Progress to 0%'
                      : 'Mark as Finished (100%)'}
                  </Text>
                </TouchableOpacity>

                {/* 3. View Book Info */}
                <TouchableOpacity
                  onPress={() => {
                    const b = contextMenuBook;
                    setContextMenuBook(null);
                    setInfoModalBook(b);
                  }}
                  style={[styles.contextActionRow, { borderBottomColor: colors.border }]}
                >
                  <Info size={18} color={colors.textPrimary} style={{ marginRight: 12 }} />
                  <Text style={[styles.contextActionText, { color: colors.textPrimary }]}>
                    View Book Info & Metadata
                  </Text>
                </TouchableOpacity>

                {/* 4. Delete Book */}
                <TouchableOpacity
                  onPress={() => handleDeleteBookSingle(contextMenuBook)}
                  style={styles.contextActionRow}
                >
                  <Trash2 size={18} color="#EF4444" style={{ marginRight: 12 }} />
                  <Text style={[styles.contextActionText, { color: '#EF4444' }]}>
                    Delete from Device
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* Book Info / Metadata Modal */}
      <Modal
        visible={Boolean(infoModalBook)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInfoModalBook(null)}
      >
        <View style={styles.modalOverlay}>
          {infoModalBook && (
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Info size={20} color={colors.accent} />
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    Book Details
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setInfoModalBook(null)}
                  style={styles.closeBtn}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoModalTopRow}>
                  <View style={[styles.infoCoverWrapper, { backgroundColor: colors.surface }]}>
                    {infoModalBook.coverImagePath ? (
                      <Image
                        source={{ uri: infoModalBook.coverImagePath }}
                        style={styles.infoCoverImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <BookOpen size={36} color={colors.accent} />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text
                      style={[styles.infoTitle, { color: colors.textPrimary }]}
                      numberOfLines={3}
                    >
                      {infoModalBook.title}
                    </Text>
                    <Text
                      style={[styles.infoAuthor, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {infoModalBook.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
                    </Text>
                    <View style={{ marginTop: 8, flexDirection: 'row', gap: 6 }}>
                      <Badge label={infoModalBook.fileFormat.toUpperCase()} variant="secondary" />
                      {infoModalBook.isFavorite && (
                        <Badge label="FAVORITE" variant="accent" />
                      )}
                    </View>
                  </View>
                </View>

                {/* Metadata Properties Table */}
                <View
                  style={[
                    styles.infoPropsCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.infoPropRow}>
                    <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                      Reading Progress
                    </Text>
                    <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                      {Math.round(infoModalBook.progressPercentage || 0)}% (
                      {infoModalBook.status || 'unread'})
                    </Text>
                  </View>

                  <View style={styles.infoPropRow}>
                    <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                      Time Spent Reading
                    </Text>
                    <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                      {formatDurationSeconds(infoModalBook.totalTimeReadSeconds || 0)}
                    </Text>
                  </View>

                  <View style={styles.infoPropRow}>
                    <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                      File Format
                    </Text>
                    <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                      {infoModalBook.fileFormat.toUpperCase()}
                    </Text>
                  </View>

                  {infoModalBook.fileSizeBytes ? (
                    <View style={styles.infoPropRow}>
                      <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                        File Size
                      </Text>
                      <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                        {(infoModalBook.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.infoPropRow}>
                    <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                      Date Added
                    </Text>
                    <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                      {new Date(infoModalBook.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <View style={styles.infoPropRow}>
                    <Text style={[styles.infoPropLabel, { color: colors.textSecondary }]}>
                      Last Read
                    </Text>
                    <Text style={[styles.infoPropValue, { color: colors.textPrimary }]}>
                      {formatRelativeDate(infoModalBook.lastReadAt)}
                    </Text>
                  </View>
                </View>

                {infoModalBook.description ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Description / Summary
                    </Text>
                    <Text
                      style={[
                        styles.infoDescriptionText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {infoModalBook.description}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => {
                    const id = infoModalBook.id;
                    setInfoModalBook(null);
                    router.push(`/reader/${id}` as any);
                  }}
                  style={[styles.saveServerBtn, { backgroundColor: colors.accent, marginTop: 20 }]}
                >
                  <Text
                    style={[
                      styles.saveServerBtnText,
                      { color: colors.isDark ? '#000000' : '#FFFFFF' },
                    ]}
                  >
                    Open in Reader
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
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
    paddingTop: 16,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleCapsule: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 3,
    width: '100%',
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 21,
  },
  activeToggleTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleTabText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  searchBarWrapper: {
    marginBottom: 12,
  },
  serverHubContainer: {
    marginBottom: 14,
  },
  serverHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serverDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  serverDropdownBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  serverSearchToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addServerInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addServerInlineText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11.5,
  },
  serverPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  serverPillText: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  serverSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    height: 42,
  },
  serverSearchInput: {
    flex: 1,
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
    marginRight: 2,
  },
  refreshBtn: {
    padding: 6,
    marginLeft: 2,
  },
  errorBanner: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
    color: '#EF4444',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  coverWrapper: {
    width: 62,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14.5,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
  },
  bookSummary: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 14.5,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  publishedDate: {
    fontFamily: FONTS.mono.regular,
    fontSize: 10.5,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 11.5,
    fontFamily: FONTS.mona.medium,
  },
  progressTag: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
  },
  saveServerBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveServerBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdownModalContent: {
    width: '100%',
    maxWidth: 380,
    height: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dropdownTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  categoryOptionsList: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dropdownCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownServerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownServerTitle: {
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  dropdownServerUrl: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
  noServersPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  noServersPillText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inlineAddFeedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inlineAddFeedText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
  },
  dropdownAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  dropdownAddBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyAddServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyAddServerBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeadingTitle: {
    fontFamily: FONTS.mona.extraBold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  sectionHeadingSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  sectionHeadingBadge: {
    fontFamily: FONTS.mono.regular,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  popularScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  popularCard: {
    width: 156,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  popularCoverWrapper: {
    width: '100%',
    aspectRatio: 2 / 2.75,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  popularCoverImage: {
    width: '100%',
    height: '100%',
  },
  popularPlaceholderCover: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  popularPlaceholderTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 12,
    letterSpacing: -0.2,
    lineHeight: 15,
  },
  popularRankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  popularRankText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: -0.2,
  },
  popularInfo: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  popularBookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.2,
  },
  popularBookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 8,
  },
  popularFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  popularDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
  },
  popularDownloadBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  recommendedList: {
    gap: 4,
  },
  recommendedCard: {
    marginHorizontal: 0,
    marginBottom: 10,
  },
  emptyInstalledCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  emptyInstalledTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    marginBottom: 4,
  },
  emptyInstalledSubtitle: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  sectionHeadingRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeToggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridColumnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridContainer: {
    marginBottom: 16,
  },
  gridCoverWrapper: {
    width: '100%',
    aspectRatio: 2 / 2.75,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gridCoverImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholderCover: {
    flex: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  gridPlaceholderTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 13,
    letterSpacing: -0.2,
    lineHeight: 16,
  },
  gridInfo: {
    marginTop: 6,
  },
  gridTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    lineHeight: 17,
    letterSpacing: -0.2,
  },
  gridAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    marginTop: 1.5,
  },
  gridFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gridDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
  },
  gridDownloadBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  // Device Shelf Styles
  shelfDashboardContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  shelfSummaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  shelfSummaryLeft: {
    flex: 1,
  },
  shelfStatCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  shelfStatCountText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  shelfStatDetails: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
  },
  shelfSummaryRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shelfActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  shelfActionBtnText: {
    fontSize: 11.5,
  },
  batchActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  batchSelectAllBtn: {
    paddingVertical: 4,
  },
  batchSelectAllText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  batchActionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  batchMiniActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelfFilterChipsScroll: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  shelfFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  shelfFilterChipText: {
    fontSize: 12,
    marginRight: 6,
  },
  shelfFilterCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  shelfFilterCountText: {
    fontSize: 10.5,
  },
  shelfFormatAndSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  shelfFormatScroll: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  shelfFormatChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  shelfFormatChipText: {
    fontSize: 11,
  },
  shelfSortActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shelfSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  shelfSortBtnText: {
    fontSize: 11,
  },
  shelfSortDirBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelfResetBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
    marginBottom: 6,
  },
  contextCoverWrapper: {
    width: 44,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextCoverImage: {
    width: '100%',
    height: '100%',
  },
  contextBookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  contextBookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    marginTop: 2,
  },
  contextActionsList: {
    marginTop: 4,
  },
  contextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contextActionText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13.5,
  },
  infoModalTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoCoverWrapper: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCoverImage: {
    width: '100%',
    height: '100%',
  },
  infoTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  infoAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    marginTop: 4,
  },
  infoPropsCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  infoPropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.12)',
  },
  infoPropLabel: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
  },
  infoPropValue: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  infoDescriptionText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
