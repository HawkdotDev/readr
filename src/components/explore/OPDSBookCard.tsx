import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BookOpen, Check, Download } from 'lucide-react-native';
import { OPDSBookEntry } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { FONTS } from '../../utils/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export interface OPDSBookCardProps {
  book: OPDSBookEntry;
  viewMode?: 'grid' | 'list';
  isDownloading: boolean;
  isAlreadyDownloaded: boolean;
  onDownload: (book: OPDSBookEntry) => void;
  onPress?: (book: OPDSBookEntry) => void;
}

export const OPDSBookCard: React.FC<OPDSBookCardProps> = React.memo(({
  book,
  viewMode = 'grid',
  isDownloading,
  isAlreadyDownloaded,
  onDownload,
  onPress,
}) => {
  const { colors } = useTheme();

  if (viewMode === 'grid') {
    return (
      <View style={[styles.gridContainer, { width: GRID_CARD_WIDTH }]}>
        <TouchableOpacity
          activeOpacity={onPress ? 0.8 : 1}
          onPress={() => onPress && onPress(book)}
          style={[
            styles.gridCoverWrapper,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
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
              <BookOpen size={32} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              <Text
                style={[
                  styles.gridPlaceholderTitle,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
                numberOfLines={3}
              >
                {book.title}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.gridInfo}>
          <Text
            style={[styles.gridTitle, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            style={[styles.gridAuthor, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {book.author || 'Public Domain'}
          </Text>

          <View style={styles.gridFooterRow}>
            <Badge
              label={book.fileFormat?.toUpperCase() || 'EPUB'}
              variant="secondary"
            />

            <TouchableOpacity
              onPress={() => onDownload(book)}
              disabled={isDownloading || isAlreadyDownloaded}
              style={[
                styles.gridDownloadBtn,
                {
                  backgroundColor: isAlreadyDownloaded
                    ? 'transparent'
                    : colors.accent,
                  borderColor: isAlreadyDownloaded ? colors.border : colors.accent,
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
  }

  // List View Mode
  return (
    <View
      style={[
        styles.listCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        activeOpacity={onPress ? 0.8 : 1}
        onPress={() => onPress && onPress(book)}
        style={[styles.listCoverWrapper, { backgroundColor: colors.canvas }]}
      >
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={styles.listCoverImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.listPlaceholderCover,
              { backgroundColor: colors.accent },
            ]}
          >
            <BookOpen size={24} color={colors.isDark ? '#000000' : '#FFFFFF'} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.listInfoWrapper}>
        <View style={styles.listTitleRow}>
          <Text
            style={[styles.listTitle, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {book.title}
          </Text>
        </View>

        <Text
          style={[styles.listAuthor, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {book.author || 'Public Domain Classic'}
        </Text>

        {book.summary ? (
          <Text
            style={[styles.listSummary, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {book.summary}
          </Text>
        ) : null}

        <View style={styles.listCardFooter}>
          <Badge
            label={book.fileFormat?.toUpperCase() || 'EPUB'}
            variant="secondary"
          />

          <TouchableOpacity
            onPress={() => onDownload(book)}
            disabled={isDownloading || isAlreadyDownloaded}
            style={[
              styles.listDownloadBtn,
              {
                backgroundColor: isAlreadyDownloaded
                  ? 'transparent'
                  : colors.accent,
                borderColor: isAlreadyDownloaded ? colors.border : colors.accent,
              },
            ]}
            accessible={true}
            accessibilityLabel={
              isAlreadyDownloaded ? 'In Library' : `Download ${book.title}`
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
                    styles.listDownloadBtnText,
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
                    styles.listDownloadBtnText,
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
});

const styles = StyleSheet.create({
  gridContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gridCoverWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gridCoverImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholderCover: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  gridPlaceholderTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  gridInfo: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  gridTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
    lineHeight: 16,
    marginBottom: 2,
  },
  gridAuthor: {
    fontSize: 11,
    marginBottom: 6,
  },
  gridFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  gridDownloadBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 10.5,
  },
  listCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  listCoverWrapper: {
    width: 68,
    height: 98,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listCoverImage: {
    width: '100%',
    height: '100%',
  },
  listPlaceholderCover: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfoWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  listAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  listSummary: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  listCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  listDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  listDownloadBtnText: {
    fontSize: 11.5,
  },
});
