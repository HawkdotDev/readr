import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { SearchBar } from '../../src/components/common/SearchBar';
import { Badge } from '../../src/components/common/Badge';
import { OPDSBookEntry } from '../../src/types';
import { fetchOPDSCatalog, downloadOPDSBook } from '../../src/services/opds/opdsService';
import { Download, CheckCircle2, BookOpen, Compass } from 'lucide-react-native';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<OPDSBookEntry[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOPDSCatalog(query).then(setCatalog);
  }, [query]);

  const handleDownload = async (book: OPDSBookEntry) => {
    setDownloadingId(book.id);
    const res = await downloadOPDSBook(book);
    setDownloadingId(null);

    if (res.success && res.bookId) {
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

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Explore Catalogs</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Standard Ebooks & Project Gutenberg
          </Text>
        </View>
        <Compass size={28} color={colors.accent} />
      </View>

      {/* Catalog List */}
      <FlatList
        data={catalog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.searchHeader}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search public domain classics..."
            />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              FEATURED PUBLIC DOMAIN WORKS
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDownloading = downloadingId === item.id;
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
              {/* Left Cover Icon Placeholder */}
              <View style={[styles.coverBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <BookOpen size={24} color={colors.accent} />
              </View>

              {/* Book Info */}
              <View style={styles.cardDetails}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>

                <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.author || 'Public Domain'}
                </Text>

                {item.summary && (
                  <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.summary}
                  </Text>
                )}

                <View style={styles.footerRow}>
                  <Badge label={item.fileFormat.toUpperCase()} variant="secondary" />
                  {item.published && (
                    <Text style={[styles.pubDate, { color: colors.textSecondary }]}>
                      Published {item.published}
                    </Text>
                  )}

                  {/* Download Action */}
                  <TouchableOpacity
                    onPress={() => handleDownload(item)}
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
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Download size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.downloadBtnText}>Get</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchHeader: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 6,
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
    width: 56,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  author: {
    fontSize: 13,
    marginTop: 2,
  },
  summary: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pubDate: {
    fontSize: 11,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
