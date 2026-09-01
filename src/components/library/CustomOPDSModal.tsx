import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OPDSServer, OPDSBookEntry } from '../../types';
import {
  getAllOPDSServers,
  saveOPDSServer,
  deleteOPDSServer,
  DEFAULT_OPDS_SERVERS,
} from '../../db/queries/opds';
import {
  fetchRemoteOPDSCatalog,
  downloadOPDSBook,
  CURATED_PUBLIC_DOMAIN_BOOKS,
} from '../../services/opds/opdsService';
import {
  X,
  Server,
  Plus,
  Globe,
  Trash2,
  Download,
  Check,
  Search,
  BookOpen,
  Lock,
  Compass,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface CustomOPDSModalProps {
  visible: boolean;
  onClose: () => void;
  onBookImported?: (bookTitle: string) => void;
}

export function CustomOPDSModal({
  visible,
  onClose,
  onBookImported,
}: CustomOPDSModalProps) {
  const { colors } = useTheme();

  const [servers, setServers] = useState<OPDSServer[]>(DEFAULT_OPDS_SERVERS);
  const [selectedServer, setSelectedServer] = useState<OPDSServer>(DEFAULT_OPDS_SERVERS[0]);
  const [books, setBooks] = useState<OPDSBookEntry[]>(CURATED_PUBLIC_DOMAIN_BOOKS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);

  // New server form fields
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Downloading map
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      loadServers();
    }
  }, [visible]);

  const loadServers = async () => {
    const list = await getAllOPDSServers();
    setServers(list);
    if (list.length > 0) {
      setSelectedServer(list[0]);
      fetchCatalog(list[0]);
    }
  };

  const fetchCatalog = async (server: OPDSServer, query?: string) => {
    setLoading(true);
    // If standard ebooks or default curated
    if (server.id === 'opds_standard_ebooks') {
      const q = (query || searchQuery).toLowerCase().trim();
      const filtered = q
        ? CURATED_PUBLIC_DOMAIN_BOOKS.filter(
            (b) =>
              b.title.toLowerCase().includes(q) ||
              (b.author && b.author.toLowerCase().includes(q))
          )
        : CURATED_PUBLIC_DOMAIN_BOOKS;
      setBooks(filtered);
      setLoading(false);
      return;
    }

    const result = await fetchRemoteOPDSCatalog(
      server.url,
      server.username,
      server.password,
      query || searchQuery
    );

    setLoading(false);
    if (result.entries.length > 0) {
      setBooks(result.entries);
    } else if (result.error) {
      // Fallback to sample books with a note
      setBooks(CURATED_PUBLIC_DOMAIN_BOOKS);
    }
  };

  const handleSelectServer = (server: OPDSServer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedServer(server);
    setSearchQuery('');
    fetchCatalog(server, '');
  };

  const handleSaveNewServer = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      Alert.alert('Required Fields', 'Please enter both a Server Name and a valid Feed URL.');
      return;
    }

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const saved = await saveOPDSServer({
        title: newTitle,
        url: formattedUrl,
        username: newUsername.trim() || null,
        password: newPassword || null,
        icon: 'server',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setServers((prev) => [...prev, saved]);
      setSelectedServer(saved);
      setIsAddingServer(false);
      setNewTitle('');
      setNewUrl('');
      setNewUsername('');
      setNewPassword('');
      fetchCatalog(saved);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save server');
    }
  };

  const handleDeleteServer = async (server: OPDSServer) => {
    Alert.alert('Remove Server', `Remove "${server.title}" from your catalog feeds?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteOPDSServer(server.id);
          const remaining = servers.filter((s) => s.id !== server.id);
          setServers(remaining);
          if (selectedServer.id === server.id && remaining.length > 0) {
            setSelectedServer(remaining[0]);
            fetchCatalog(remaining[0]);
          }
        },
      },
    ]);
  };

  const handleDownloadBook = async (book: OPDSBookEntry) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setDownloadingBookId(book.id);

      const result = await downloadOPDSBook(
        book,
        selectedServer.username,
        selectedServer.password
      );

      setDownloadingBookId(null);

      if (result.success) {
        setDownloadedBookIds((prev) => [...prev, book.id]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        onBookImported?.(book.title);
        Alert.alert('Book Added', `"${book.title}" was saved to your bookshelf.`);
      } else {
        Alert.alert('Import Notice', result.error || 'Failed to download ebook.');
      }
    } catch (err: any) {
      setDownloadingBookId(null);
      Alert.alert('Download Error', err?.message || 'Download failed');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Globe size={20} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>OPDS & Net Library</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <X size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Server Feed Selector Row */}
        <View style={[styles.serverRowWrapper, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverRow}>
            {servers.map((s) => {
              const isSelected = selectedServer.id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => handleSelectServer(s)}
                  onLongPress={() => s.id.startsWith('opds_') ? null : handleDeleteServer(s)}
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
                    color={isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.serverPillText,
                      {
                        color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                        fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    {s.title}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setIsAddingServer(!isAddingServer)}
              style={[styles.addServerBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Plus size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.addServerBtnText, { color: colors.accent }]}>+ Add Server</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Add Server Form Drawer */}
        {isAddingServer && (
          <View style={[styles.addServerBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.boxTitle, { color: colors.textPrimary }]}>Connect Calibre / OPDS Server</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.canvas, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Server Name (e.g. My Calibre Ebooks)"
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.canvas, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Catalog Feed URL (e.g. http://192.168.1.5:8080/opds)"
              placeholderTextColor={colors.textSecondary}
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.authRow}>
              <TextInput
                style={[styles.authInput, { backgroundColor: colors.canvas, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Username (optional)"
                placeholderTextColor={colors.textSecondary}
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.authInput, { backgroundColor: colors.canvas, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={() => setIsAddingServer(false)}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNewServer}
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.saveBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
                  Save & Connect
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={`Search ${selectedServer.title}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                fetchCatalog(selectedServer, text);
              }}
            />
          </View>
        </View>

        {/* Ebook Catalog List */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Connecting to {selectedServer.title}...
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.catalogList}>
            {books.length === 0 ? (
              <View style={styles.emptyView}>
                <BookOpen size={36} color={colors.textSecondary} style={{ marginBottom: 10, opacity: 0.5 }} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No e-books found matching your search.
                </Text>
              </View>
            ) : (
              books.map((book) => {
                const isDownloaded = downloadedBookIds.includes(book.id);
                const isDownloading = downloadingBookId === book.id;

                return (
                  <View
                    key={book.id}
                    style={[styles.bookCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    {/* Cover Preview */}
                    <View style={[styles.coverWrapper, { backgroundColor: colors.canvas }]}>
                      {book.coverUrl ? (
                        <Image source={{ uri: book.coverUrl }} style={styles.coverImg} resizeMode="cover" />
                      ) : (
                        <BookOpen size={24} color={colors.textSecondary} />
                      )}
                    </View>

                    {/* Book Info */}
                    <View style={styles.bookInfoCol}>
                      <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                        {book.author || 'Unknown Author'}
                      </Text>
                      {book.summary ? (
                        <Text style={[styles.bookSummary, { color: colors.textSecondary }]} numberOfLines={2}>
                          {book.summary}
                        </Text>
                      ) : null}

                      {/* Download Action */}
                      <View style={styles.cardFooter}>
                        <TouchableOpacity
                          onPress={() => handleDownloadBook(book)}
                          disabled={isDownloaded || isDownloading}
                          style={[
                            styles.downloadBtn,
                            {
                              backgroundColor: isDownloaded ? colors.canvas : colors.accent,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          {isDownloading ? (
                            <ActivityIndicator size="small" color={colors.isDark ? '#000000' : '#FFFFFF'} />
                          ) : isDownloaded ? (
                            <>
                              <Check size={14} color="#10B981" style={{ marginRight: 4 }} />
                              <Text style={[styles.downloadBtnText, { color: '#10B981' }]}>In Library</Text>
                            </>
                          ) : (
                            <>
                              <Download size={14} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 4 }} />
                              <Text
                                style={[
                                  styles.downloadBtnText,
                                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                                ]}
                              >
                                Download {book.fileFormat.toUpperCase()}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
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
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverRowWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  serverRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  serverPillText: {
    fontSize: 12.5,
  },
  addServerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  addServerBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  addServerBox: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  boxTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
  input: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  authRow: {
    flexDirection: 'row',
    gap: 8,
  },
  authInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  catalogList: {
    padding: 16,
    gap: 12,
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  bookCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  coverWrapper: {
    width: 64,
    height: 94,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  bookInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2,
  },
  bookSummary: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  downloadBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
  },
});
