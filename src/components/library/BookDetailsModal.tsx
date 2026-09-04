import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { OptimizedImage } from '../common/OptimizedImage';
import { Info, BookOpen, X } from 'lucide-react-native';
import { Book } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { Badge } from '../common/Badge';
import { FONTS } from '../../utils/typography';
import { formatDurationSeconds, formatRelativeDate } from '../../utils/time';

export interface BookDetailsModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onOpenReader: (bookId: string) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = React.memo(({
  visible,
  book,
  onClose,
  onOpenReader,
}) => {
  const { colors } = useTheme();

  if (!book) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
              <Info size={20} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Book Details
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.topRow}>
              <View style={[styles.coverWrapper, { backgroundColor: colors.surface }]}>
                {book.coverImagePath ? (
                  <OptimizedImage
                    source={{ uri: book.coverImagePath }}
                    style={styles.coverImage}
                    contentFit="cover"
                  />
                ) : (
                  <BookOpen size={36} color={colors.accent} />
                )}
              </View>
              <View style={styles.topInfo}>
                <Text
                  style={[styles.bookTitle, { color: colors.textPrimary }]}
                  numberOfLines={3}
                >
                  {book.title}
                </Text>
                <Text
                  style={[styles.bookAuthor, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {book.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
                </Text>
                <View style={styles.badgesRow}>
                  <Badge label={book.fileFormat.toUpperCase()} variant="secondary" />
                  {book.isFavorite && <Badge label="FAVORITE" variant="accent" />}
                </View>
              </View>
            </View>

            {/* Metadata Properties Table */}
            <View
              style={[
                styles.propsCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                  Reading Progress
                </Text>
                <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                  {Math.round(book.progressPercentage || 0)}% ({book.status || 'unread'})
                </Text>
              </View>

              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                  Time Spent Reading
                </Text>
                <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                  {formatDurationSeconds(book.totalTimeReadSeconds || 0)}
                </Text>
              </View>

              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                  File Format
                </Text>
                <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                  {book.fileFormat.toUpperCase()}
                </Text>
              </View>

              {book.fileSizeBytes ? (
                <View style={styles.propRow}>
                  <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                    File Size
                  </Text>
                  <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                    {(book.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </Text>
                </View>
              ) : null}

              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                  Date Added
                </Text>
                <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                  {new Date(book.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.propRow}>
                <Text style={[styles.propLabel, { color: colors.textSecondary }]}>
                  Last Read
                </Text>
                <Text style={[styles.propValue, { color: colors.textPrimary }]}>
                  {formatRelativeDate(book.lastReadAt)}
                </Text>
              </View>
            </View>

            {book.description ? (
              <View style={{ marginTop: 14 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Description / Summary
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                  {book.description}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => {
                const id = book.id;
                onClose();
                onOpenReader(id);
              }}
              style={[styles.openReaderBtn, { backgroundColor: colors.accent }]}
            >
              <Text
                style={[
                  styles.openReaderBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Open in Reader
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  coverWrapper: {
    width: 90,
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topInfo: {
    flex: 1,
    marginLeft: 14,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  bookAuthor: {
    fontSize: 13,
    marginTop: 4,
  },
  badgesRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
  },
  propsCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  propLabel: {
    fontSize: 12,
  },
  propValue: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
  },
  fieldLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  openReaderBtn: {
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  openReaderBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
});
