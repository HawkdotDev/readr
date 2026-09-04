import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { OptimizedImage } from '../common/OptimizedImage';
import { Compass, BookOpen, Check, Download } from 'lucide-react-native';
import { OPDSBookEntry } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { FONTS } from '../../utils/typography';

export interface RecommendedBooksSectionProps {
  books: OPDSBookEntry[];
  serverTitle: string;
  downloadingId: string | null;
  downloadedBookIds: string[];
  onDownload: (book: OPDSBookEntry) => void;
  onPressBook?: (book: OPDSBookEntry) => void;
}

export const RecommendedBooksSection: React.FC<RecommendedBooksSectionProps> = React.memo(({
  books,
  serverTitle,
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
          <Compass size={16} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.headingTitle, { color: colors.textPrimary }]}>
            Recommended
          </Text>
        </View>
        <Text style={[styles.headingSubtitle, { color: colors.textSecondary }]}>
          Curated from {serverTitle || 'server'}
        </Text>
      </View>

      <View style={styles.list}>
        {books.map((book) => {
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
                style={[styles.coverWrapper, { backgroundColor: colors.canvas }]}
              >
                {book.coverUrl ? (
                  <OptimizedImage
                    source={{ uri: book.coverUrl }}
                    style={styles.coverImage}
                    contentFit="cover"
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
              </TouchableOpacity>

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
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  coverWrapper: {
    width: 68,
    height: 98,
    borderRadius: 8,
    overflow: 'hidden',
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
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  bookAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  bookSummary: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 11.5,
  },
});
