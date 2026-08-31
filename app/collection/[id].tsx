import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { BookCard } from '../../src/components/library/BookCard';
import { getAllBooks } from '../../src/db/queries/books';
import { getBooksInCollection } from '../../src/db/queries/collections';
import { Book } from '../../src/types';
import { ArrowLeft, Bookmark } from 'lucide-react-native';

export default function CollectionScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [all, bookIds] = await Promise.all([getAllBooks(), getBooksInCollection(id)]);
      const idSet = new Set(bookIds);
      setBooks(all.filter((b) => idSet.has(b.id)));
    }
    load();
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {title || 'Shelf Collection'}
        </Text>
        <Bookmark size={20} color={colors.accent} />
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No books in this shelf yet. Add books from their details screen.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            viewMode="list"
            onPress={() => router.push(`/reader/${item.id}` as any)}
          />
        )}
      />
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
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
