import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { useBook } from '../../src/hooks/useBook';
import { formatDurationSeconds, formatRelativeDate } from '../../src/utils/time';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Clock,
  FileText,
  Trash2,
  Star,
  Tag as TagIcon,
  Plus,
  X,
} from 'lucide-react-native';
import { FONTS } from '../../src/utils/typography';
import * as Haptics from 'expo-haptics';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const {
    book,
    tags,
    allTags,
    toggleBookFavorite,
    updateRating,
    addTag,
    removeTag,
    removeBook,
  } = useBook(id || '');

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleDelete = () => {
    if (!book) return;
    Alert.alert(
      'Remove from Library',
      `Are you sure you want to remove "${book.title}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeBook();
            if (success) {
              router.replace('/library');
            }
          },
        },
      ]
    );
  };

  const handleAddTagSubmit = async () => {
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim());
    setNewTagName('');
    setIsAddingTag(false);
  };

  if (!book) return null;

  const authorName =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => a.name).join(', ')
      : 'Unknown Author';

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          Book Details
        </Text>
        <TouchableOpacity onPress={toggleBookFavorite} style={styles.favBtn}>
          <Heart
            size={22}
            color={book.isFavorite ? '#EF4444' : colors.textSecondary}
            fill={book.isFavorite ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Book Cover Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.coverBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {book.coverImagePath ? (
              <Image source={{ uri: book.coverImagePath }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholderCover, { backgroundColor: colors.accent }]}>
                <BookOpen size={48} color={colors.isDark ? '#000000' : '#FFFFFF'} />
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{authorName}</Text>

          <View style={styles.badgeRow}>
            <Badge label={book.fileFormat.toUpperCase()} variant="primary" />
            <Badge label={book.status.toUpperCase()} variant="secondary" />
          </View>

          {/* Interactive 5-Star Rating Control */}
          <View style={styles.ratingHeroRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (book.rating || 0) >= star;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    const nextRating = book.rating === star ? 0 : star;
                    updateRating(nextRating);
                  }}
                  style={styles.starTouch}
                >
                  <Star
                    size={24}
                    color={isFilled ? '#F59E0B' : colors.border}
                    fill={isFilled ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Read Action Button */}
        <Button
          title={book.progressPercentage > 0 ? `Resume Reading (${Math.round(book.progressPercentage)}%)` : 'Start Reading'}
          variant="primary"
          icon={<BookOpen size={18} color={colors.isDark ? '#000000' : '#FFFFFF'} />}
          onPress={() => router.push(`/reader/${book.id}` as any)}
          style={{ marginVertical: 16 }}
        />

        {/* Tags & Categorization Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TAGS & COLLECTIONS</Text>
          <TouchableOpacity
            onPress={() => setIsAddingTag(!isAddingTag)}
            style={styles.addTagTrigger}
          >
            <Plus size={14} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.addTagTriggerText, { color: colors.accent }]}>Add Tag</Text>
          </TouchableOpacity>
        </View>

        {isAddingTag && (
          <View style={[styles.addTagForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.tagInput, { backgroundColor: colors.canvas, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Enter tag name (e.g. Classics, Sci-Fi)..."
              placeholderTextColor={colors.textSecondary}
              value={newTagName}
              onChangeText={setNewTagName}
              autoFocus
              onSubmitEditing={handleAddTagSubmit}
            />
            <View style={styles.tagFormActions}>
              <TouchableOpacity
                onPress={() => {
                  setIsAddingTag(false);
                  setNewTagName('');
                }}
                style={[styles.tagFormBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.tagFormBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTagSubmit}
                style={[styles.tagFormBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.tagFormBtnText, { color: colors.isDark ? '#000000' : '#FFFFFF', fontFamily: FONTS.mona.bold }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tagChipsWrap}>
          {tags.length === 0 && !isAddingTag ? (
            <Text style={[styles.noTagsText, { color: colors.textSecondary }]}>No tags assigned yet.</Text>
          ) : (
            tags.map((t) => (
              <View
                key={t.id}
                style={[styles.tagChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <TagIcon size={12} color={colors.accent} style={{ marginRight: 5 }} />
                <Text style={[styles.tagChipText, { color: colors.textPrimary }]}>{t.name}</Text>
                <TouchableOpacity
                  onPress={() => removeTag(t.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={styles.tagRemoveBtn}
                >
                  <X size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Reading Stats Card */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>READING PROGRESS</Text>
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time Read:</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatDurationSeconds(book.totalTimeReadSeconds)}
            </Text>
          </View>

          <View style={[styles.statItem, { marginTop: 10 }]}>
            <FileText size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Read:</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRelativeDate(book.lastReadAt)}
            </Text>
          </View>
        </View>

        {/* Description / Summary */}
        {book.description && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
              SYNOPSIS
            </Text>
            <View style={[styles.descCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.descText, { color: colors.textPrimary }]}>{book.description}</Text>
            </View>
          </>
        )}

        {/* Danger Action */}
        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.deleteBtn, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
        >
          <Trash2 size={16} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>Remove Book from Library</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  favBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  coverBox: {
    width: 140,
    height: 200,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
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
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  author: {
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingHeroRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingVertical: 6,
  },
  starTouch: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  addTagTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addTagTriggerText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  addTagForm: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  tagInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  tagFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tagFormBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  tagFormBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noTagsText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    fontStyle: 'italic',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginRight: 6,
  },
  tagRemoveBtn: {
    padding: 2,
  },
  statsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    marginRight: 6,
  },
  statValue: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  descCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  descText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  deleteBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
    color: '#EF4444',
  },
});
