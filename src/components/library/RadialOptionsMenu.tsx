import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Image,
  Share,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BookOpen, Info, Heart, CheckCircle2, Share2, Trash2, X, Star } from 'lucide-react-native';
import { Book } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface RadialOptionsMenuProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onOpenDetails: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
  onToggleStatus: (book: Book) => void;
  onUpdateRating?: (book: Book, rating: number) => void;
  onDeleteBook: (book: Book) => void;
}

export const RadialOptionsMenu: React.FC<RadialOptionsMenuProps> = ({
  visible,
  book,
  onClose,
  onOpenReader,
  onOpenDetails,
  onToggleFavorite,
  onToggleStatus,
  onUpdateRating,
  onDeleteBook,
}) => {
  const { colors } = useTheme();

  // Animation values for smooth popover dropdown
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!book || !visible) return null;

  const authorName =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(', ')
      : 'Unknown Author';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Currently reading "${book.title}" by ${authorName} on Readr!`,
        title: book.title,
      });
    } catch {}
  };

  const handleDeletePrompt = () => {
    Alert.alert(
      'Remove Book',
      `Are you sure you want to remove "${book.title}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onDeleteBook(book);
            onClose();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'read',
      label: 'Read Now',
      icon: (color: string) => <BookOpen size={18} color={color} />,
      color: colors.accent,
      isPrimary: true,
      onPress: () => {
        onOpenReader(book);
        onClose();
      },
    },
    {
      id: 'details',
      label: 'Book Details',
      icon: (color: string) => <Info size={18} color={color} />,
      color: colors.textPrimary,
      onPress: () => {
        onOpenDetails(book);
        onClose();
      },
    },
    {
      id: 'favorite',
      label: book.isFavorite ? 'Remove Favorite' : 'Add to Favorites',
      icon: (color: string) => (
        <Heart
          size={18}
          color={book.isFavorite ? '#EF4444' : color}
          fill={book.isFavorite ? '#EF4444' : 'transparent'}
        />
      ),
      color: book.isFavorite ? '#EF4444' : colors.textPrimary,
      onPress: () => {
        onToggleFavorite(book);
        onClose();
      },
    },
    {
      id: 'status',
      label: book.status === 'finished' ? 'Mark as Reading' : 'Mark as Finished',
      icon: (color: string) => (
        <CheckCircle2
          size={18}
          color={book.status === 'finished' ? '#10B981' : color}
          fill={book.status === 'finished' ? 'rgba(16, 185, 129, 0.15)' : 'transparent'}
        />
      ),
      color: book.status === 'finished' ? '#10B981' : colors.textPrimary,
      onPress: () => {
        onToggleStatus(book);
        onClose();
      },
    },
    {
      id: 'share',
      label: 'Share Book',
      icon: (color: string) => <Share2 size={18} color={color} />,
      color: colors.textPrimary,
      onPress: () => {
        handleShare();
        onClose();
      },
    },
    {
      id: 'delete',
      label: 'Remove from Library',
      icon: () => <Trash2 size={18} color="#EF4444" />,
      color: '#EF4444',
      isDestructive: true,
      onPress: () => {
        handleDeletePrompt();
      },
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: colors.isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.35)',
              opacity: opacityAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.dropdownCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {/* Header with Book Thumbnail and Details */}
              <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.coverThumbnailWrapper}>
                  {book.coverImagePath ? (
                    <Image
                      source={{ uri: book.coverImagePath }}
                      style={styles.coverThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.placeholderThumbnail, { backgroundColor: colors.accent }]}>
                      <BookOpen size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                    </View>
                  )}
                </View>

                <View style={styles.headerInfo}>
                  <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                    {authorName}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.closeBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                  accessible={true}
                  accessibilityLabel="Close dropdown menu"
                >
                  <X size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Star Rating Bar */}
              <View style={[styles.ratingRow, { borderBottomColor: colors.border, backgroundColor: colors.canvas }]}>
                <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rating</Text>
                <View style={styles.starsWrap}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (book.rating || 0) >= star;
                    return (
                      <TouchableOpacity
                        key={star}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          const newRating = (book.rating || 0) === star ? 0 : star;
                          onUpdateRating?.(book, newRating);
                        }}
                        style={styles.starBtn}
                        accessible={true}
                        accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={18}
                          color={isFilled ? '#F59E0B' : colors.border}
                          fill={isFilled ? '#F59E0B' : 'transparent'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action List */}
              <View style={styles.actionsList}>
                {menuItems.map((item, idx) => {
                  const isLast = idx === menuItems.length - 1;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                        item.onPress();
                      }}
                      style={[
                        styles.actionRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                      accessible={true}
                      accessibilityLabel={item.label}
                    >
                      <View style={styles.actionIcon}>{item.icon(item.color)}</View>
                      <Text
                        style={[
                          styles.actionLabel,
                          {
                            color: item.color,
                            fontFamily: item.isPrimary ? FONTS.mona.bold : FONTS.mona.medium,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const BookDropdownMenu = RadialOptionsMenu;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  coverThumbnailWrapper: {
    width: 36,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  coverThumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  bookTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsList: {
    paddingVertical: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  ratingLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  starsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBtn: {
    padding: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
});

export default RadialOptionsMenu;
export const BookOptionsMenu = RadialOptionsMenu;
export type BookOptionsMenuProps = RadialOptionsMenuProps;
