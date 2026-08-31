import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { getBookById, toggleBookFavorite, deleteBook } from '../../src/db/queries/books';
import { Book } from '../../src/types';
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
  Share2,
} from 'lucide-react-native';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [book, setBook] = useState<Book | null>(null);

  const loadBook = async () => {
    if (!id) return;
    const b = await getBookById(id);
    setBook(b);
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!book) return;
    const next = await toggleBookFavorite(book.id, book.isFavorite);
    setBook({ ...book, isFavorite: next });
  };

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
            await deleteBook(book.id);
            router.replace('/library');
          },
        },
      ]
    );
  };

  if (!book) return null;

  const authorName = book.authors && book.authors.length > 0 ? book.authors.map((a) => a.name).join(', ') : 'Unknown Author';

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
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favBtn}>
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
                <BookOpen size={48} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>{authorName}</Text>

          <View style={styles.badgeRow}>
            <Badge label={book.fileFormat.toUpperCase()} variant="primary" />
            <Badge label={book.status.toUpperCase()} variant="secondary" />
          </View>
        </View>

        {/* Read Action Button */}
        <Button
          title={book.progressPercentage > 0 ? `Resume Reading (${Math.round(book.progressPercentage)}%)` : 'Start Reading'}
          variant="primary"
          icon={<BookOpen size={18} color="#FFFFFF" />}
          onPress={() => router.push(`/reader/${book.id}` as any)}
          style={{ marginVertical: 16 }}
        />

        {/* Reading Stats Card */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>READING PROGRESS</Text>
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

import { FONTS } from '../../src/utils/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  favBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  heroSection: {
    alignItems: 'center',
  },
  coverBox: {
    width: 140,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
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
    fontFamily: FONTS.hubot.bold,
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  author: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
    marginRight: 6,
  },
  statValue: {
    fontFamily: FONTS.mono.bold,
    fontSize: 13,
  },
  descCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  descText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
    letterSpacing: -0.1,
  },
});
