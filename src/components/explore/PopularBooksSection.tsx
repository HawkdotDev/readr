import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Sparkles, BookOpen, Check, Download } from 'lucide-react-native';
import { OPDSBookEntry } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { FONTS } from '../../utils/typography';

export interface PopularBooksSectionProps {
  books: OPDSBookEntry[];
  downloadingId: string | null;
  downloadedBookIds: string[];
  onDownload: (book: OPDSBookEntry) => void;
  onPressBook?: (book: OPDSBookEntry) => void;
}

export const PopularBooksSection: React.FC<PopularBooksSectionProps> = React.memo(({
  books,
  downloadingId,
  downloadedBookIds,
  onDownload,
  onPressBook,
}) => {
  const { colors } = useTheme();

  if (!books || books.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headingWrapper}>
        <View style={styles.headingLeft}>
          <Sparkles size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.headingTitle, { color: colors.textPrimary }]}>
            Popular
          </Text>
        </View>
        <Text style={[styles.headingSubtitle, { color: colors.textSecondary }]}>
          Top picks not on device
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {books.map((book, index) => {
          const isDownloading = downloadingId === book.id;
          const isAlreadyDownloaded = downloadedBookIds.includes(
            book.title.toLowerCase().trim()
          );

          return (
            <View
              key={book.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TouchableOpacity
                activeOpacity={onPressBook ? 0.8 : 1}
                onPress={() => onPressBook && onPressBook(book)}
                style={[
                  styles.coverWrapper,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
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
                      size={28}
                      color={colors.isDark ? '#000000' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.placeholderTitle,
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
                    styles.rankBadge,
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
                      styles.rankText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    #{index + 1}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.info}>
                <Text
                  style={[styles.bookTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                <Text
                  style={[styles.bookAuthor, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {book.author || 'Classic'}
                </Text>

                <View style={styles.footerRow}>
                  <Badge
                    label={book.fileFormat?.toUpperCase() || 'EPUB'}
                    variant="secondary"
                  />

                  <TouchableOpacity
                    onPress={() => onDownload(book)}
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
                            styles.downloadBtnText,
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
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  headingSubtitle: {
    fontSize: 11.5,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  placeholderTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  rankText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 9.5,
  },
  info: {
    padding: 10,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 16,
  },
  bookAuthor: {
    fontSize: 10.5,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10.5,
  },
});
