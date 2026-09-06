import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { BookOpen, Info, Heart, CheckCircle2, Trash2, X, Bookmark, ArrowLeft, Plus, Check } from 'lucide-react-native';
import { Book, Collection } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import {
  getAllCollections,
  createCollection,
  addBookToCollection,
  removeBookFromCollection,
  getBooksInCollection,
} from '../../db/queries/collections';
import * as Haptics from 'expo-haptics';

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

  const [viewState, setViewState] = useState<'options' | 'collections'>('options');
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [activeCollectionIds, setActiveCollectionIds] = useState<Set<string>>(new Set());
  const [newColName, setNewColName] = useState('');
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  useEffect(() => {
    if (!visible) {
      setViewState('options');
      setIsCreatingCol(false);
      setNewColName('');
    }
  }, [visible]);

  if (!book) return null;

  const handleOpenCollections = async () => {
    setViewState('collections');
    try {
      const cols = await getAllCollections();
      setUserCollections(cols);
      const active = new Set<string>();
      for (const c of cols) {
        const bookIds = await getBooksInCollection(c.id);
        if (bookIds.includes(book.id)) {
          active.add(c.id);
        }
      }
      setActiveCollectionIds(active);
    } catch (err) {
      console.warn('Failed to load collections:', err);
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const isMember = activeCollectionIds.has(collectionId);
    try {
      if (isMember) {
        await removeBookFromCollection(book.id, collectionId);
        setActiveCollectionIds((prev) => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });
      } else {
        await addBookToCollection(book.id, collectionId);
        setActiveCollectionIds((prev) => {
          const next = new Set(prev);
          next.add(collectionId);
          return next;
        });
      }
    } catch (err) {
      console.warn('Failed to update book collection:', err);
    }
  };

  const handleCreateCollection = async () => {
    if (!newColName.trim()) return;
    try {
      const name = newColName.trim();
      const created = await createCollection(name);
      await addBookToCollection(book.id, created.id);
      setUserCollections((prev) => [...prev, created]);
      setActiveCollectionIds((prev) => new Set([...prev, created.id]));
      setNewColName('');
      setIsCreatingCol(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      console.warn('Failed to create collection:', err);
    }
  };

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
          {viewState === 'options' ? (
            <>
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
                  onPress={handleOpenCollections}
                  style={[
                    styles.optionItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Bookmark size={16} color={colors.accent} style={{ marginRight: 10 }} />
                  <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                    Add to Collection
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
                    color={book.isFavorite ? (colors.isMonochrome ? '#FFFFFF' : '#EF4444') : colors.textSecondary}
                    fill={book.isFavorite ? (colors.isMonochrome ? '#FFFFFF' : '#EF4444') : 'transparent'}
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
                  <Trash2 size={16} color={colors.isMonochrome ? colors.textPrimary : '#EF4444'} style={{ marginRight: 10 }} />
                  <Text style={[styles.optionLabel, { color: colors.isMonochrome ? colors.textPrimary : '#EF4444' }]}>
                    Delete from Device
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Collections Management View */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => setViewState('options')}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}
                >
                  <ArrowLeft size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.title, { color: colors.textPrimary }]}>Collections</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 12 }]}>
                Choose which collections include this book:
              </Text>

              <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                {userCollections.length > 0 ? (
                  userCollections.map((col) => {
                    const isMember = activeCollectionIds.has(col.id);
                    return (
                      <TouchableOpacity
                        key={col.id}
                        onPress={() => handleToggleCollection(col.id)}
                        style={[
                          styles.colPickerItem,
                          {
                            backgroundColor: isMember
                              ? colors.isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.04)'
                              : colors.surface,
                            borderColor: isMember ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.colPickerName,
                              {
                                color: colors.textPrimary,
                                fontFamily: isMember ? FONTS.mona.bold : FONTS.mona.medium,
                              },
                            ]}
                          >
                            {col.name}
                          </Text>
                          {col.description ? (
                            <Text
                              style={[styles.colPickerDesc, { color: colors.textSecondary }]}
                              numberOfLines={1}
                            >
                              {col.description}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={[
                            styles.colCheckbox,
                            {
                              backgroundColor: isMember ? colors.accent : 'transparent',
                              borderColor: isMember ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          {isMember && (
                            <Check
                              size={12}
                              color={colors.isDark ? '#000000' : '#FFFFFF'}
                              strokeWidth={3}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={[styles.emptyColsText, { color: colors.textSecondary }]}>
                    No collections yet. Create your first collection below.
                  </Text>
                )}
              </ScrollView>

              {/* Create Collection Inline */}
              {isCreatingCol ? (
                <View style={[styles.createColBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <TextInput
                    value={newColName}
                    onChangeText={setNewColName}
                    placeholder="Collection name (e.g. Sci-Fi Favorites)..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.createColInput, { color: colors.textPrimary, borderColor: colors.border }]}
                    autoFocus={true}
                    onSubmitEditing={handleCreateCollection}
                  />
                  <View style={styles.createColActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setIsCreatingCol(false);
                        setNewColName('');
                      }}
                      style={[styles.createColBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.createColBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCreateCollection}
                      style={[styles.createColBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                    >
                      <Text style={[styles.createColBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsCreatingCol(true)}
                  style={[styles.newColTrigger, { borderColor: colors.border }]}
                >
                  <Plus size={14} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.newColTriggerText, { color: colors.accent }]}>
                    Create New Collection
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  colPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  colPickerName: {
    fontSize: 13.5,
  },
  colPickerDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
  colCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  emptyColsText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 16,
  },
  createColBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  createColInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: FONTS.mona.regular,
  },
  createColActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  createColBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  createColBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12,
  },
  newColTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  newColTriggerText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
