import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { BookOpen, Info, Heart, CheckCircle2, Trash2, X } from 'lucide-react-native';
import { Book } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface BookContextMenuModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onOpenReader: (bookId: string) => void;
  onOpenDetails: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
  onToggleStatus: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export const BookContextMenuModal: React.FC<BookContextMenuModalProps> = React.memo(({
  visible,
  book,
  onClose,
  onOpenReader,
  onOpenDetails,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
}) => {
  const { colors } = useTheme();

  if (!book) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Dismiss options"
        />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.title, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {book.title}
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {book.authors?.map((a) => a.name).join(', ') || 'Unknown Author'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              onPress={() => {
                const id = book.id;
                onClose();
                onOpenReader(id);
              }}
              style={[
                styles.optionItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <BookOpen size={16} color={colors.accent} style={{ marginRight: 10 }} />
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                Read Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenDetails(book);
              }}
              style={[
                styles.optionItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Info size={16} color={colors.accent} style={{ marginRight: 10 }} />
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                Book Info & Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleFavorite(book)}
              style={[
                styles.optionItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Heart
                size={16}
                color={book.isFavorite ? '#EF4444' : colors.textSecondary}
                fill={book.isFavorite ? '#EF4444' : 'transparent'}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {book.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggleStatus(book)}
              style={[
                styles.optionItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <CheckCircle2 size={16} color={colors.accent} style={{ marginRight: 10 }} />
              <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                {book.status === 'finished'
                  ? 'Mark as Currently Reading'
                  : 'Mark as Finished'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onDelete(book);
              }}
              style={[
                styles.optionItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Trash2 size={16} color="#EF4444" style={{ marginRight: 10 }} />
              <Text style={[styles.optionLabel, { color: '#EF4444' }]}>
                Delete from Device
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLabel: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13.5,
  },
});
