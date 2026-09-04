import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { OptimizedImage } from '../common/OptimizedImage';
import { Book } from '../../types';
import { FONTS } from '../../utils/typography';
import {
  Compass,
  BookOpen,
  Download,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface MoodPreset {
  id: string;
  emoji: string;
  label: string;
  theme: string;
  bookTitle: string;
  author: string;
  reason: string;
  coverUrl: string;
  downloadUrl: string;
}

export const READING_MOODS: MoodPreset[] = [
  {
    id: 'mood_victorian',
    emoji: '☕',
    label: 'Cozy Victorian',
    theme: 'Romantic Satire & Wit',
    bookTitle: 'Pride and Prejudice',
    author: 'Jane Austen',
    reason: 'A sparkling, witty immersion into country estates, irony, and independent hearts.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/jane-austen/pride-and-prejudice/downloads/jane-austen_pride-and-prejudice.epub',
  },
  {
    id: 'mood_gothic',
    emoji: '🕯️',
    label: 'Gothic & Haunting',
    theme: 'Moral Ambition & Darkness',
    bookTitle: 'Frankenstein',
    author: 'Mary Shelley',
    reason: 'A chilling, philosophical examination of human creation, hubris, and loneliness.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439471-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/mary-shelley/frankenstein/downloads/mary-shelley_frankenstein.epub?source=download',
  },
  {
    id: 'mood_stoic',
    emoji: '🌿',
    label: 'Quiet Solitude',
    theme: 'Philosophy & Equanimity',
    bookTitle: 'Letters from a Stoic',
    author: 'Lucius Seneca',
    reason: 'Timeless Roman wisdom on navigating anxiety, preserving inner tranquility, and valuing friendship.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/seneca/epistles/richard-mott-gummere/downloads/seneca_epistles_richard-mott-gummere.epub',
  },
  {
    id: 'mood_surreal',
    emoji: '🌀',
    label: 'Surreal Parable',
    theme: 'Modernist Absurdity',
    bookTitle: 'The Metamorphosis',
    author: 'Franz Kafka',
    reason: 'A profound, unforgettable exploration of alienation and familial guilt.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/franz-kafka/the-metamorphosis/downloads/franz-kafka_the-metamorphosis.epub',
  },
  {
    id: 'mood_jazz',
    emoji: '🎷',
    label: 'Jazz Age Allure',
    theme: 'Decadence & Idealism',
    bookTitle: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    reason: 'A glittering, lyrical critique of glamour, longing, and the illusory American dream.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    downloadUrl: 'https://standardebooks.org/ebooks/f-scott-fitzgerald/the-great-gatsby/downloads/f-scott-fitzgerald_the-great-gatsby.epub?source=download',
  },
];

export interface ReadingMoodMatcherCardProps {
  books: Book[];
  moods?: MoodPreset[];
  downloadingId?: string | null;
  onDownloadBook: (title: string, author: string, downloadUrl: string, coverUrl?: string) => void;
  onOpenBook: (bookId: string) => void;
}

export const ReadingMoodMatcherCard: React.FC<ReadingMoodMatcherCardProps> = ({
  books,
  moods = READING_MOODS,
  downloadingId,
  onDownloadBook,
  onOpenBook,
}) => {
  const { colors } = useTheme();
  const [selectedMoodId, setSelectedMoodId] = useState<string>(moods[0]?.id || READING_MOODS[0].id);

  const activeMood = moods.find((m) => m.id === selectedMoodId) || moods[0] || READING_MOODS[0];

  const inLibrary = books.find(
    (b) => b.title.toLowerCase().trim() === activeMood.bookTitle.toLowerCase().trim()
  );

  const isDownloading = downloadingId === activeMood.bookTitle;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Compass size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            WHAT'S YOUR READING MOOD TODAY?
          </Text>
        </View>
      </View>

      {/* Mood Pills Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodPillsRow}
      >
        {moods.map((mood) => {
          const isSelected = selectedMoodId === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelectedMoodId(mood.id);
              }}
              style={[
                styles.moodPill,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={{ marginRight: 5 }}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodPillText,
                  {
                    color: isSelected
                      ? colors.isDark
                        ? '#000000'
                        : '#FFFFFF'
                      : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Matched Book Card */}
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.moodCardTop}>
          {activeMood.coverUrl ? (
            <OptimizedImage
              source={{ uri: activeMood.coverUrl }}
              style={styles.moodCover}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.moodCoverFallback,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <BookOpen size={20} color={colors.accent} />
            </View>
          )}

          <View style={styles.moodDetails}>
            <View
              style={[
                styles.moodThemeBadge,
                {
                  backgroundColor: colors.isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
            >
              <Text style={[styles.moodThemeText, { color: colors.accent }]}>
                {activeMood.theme}
              </Text>
            </View>

            <Text style={[styles.moodBookTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {activeMood.bookTitle}
            </Text>
            <Text style={[styles.moodBookAuthor, { color: colors.textSecondary }]}>
              {activeMood.author}
            </Text>
          </View>
        </View>

        <Text style={[styles.moodReasonText, { color: colors.textSecondary }]}>
          {activeMood.reason}
        </Text>

        <TouchableOpacity
          onPress={() => {
            if (inLibrary) {
              onOpenBook(inLibrary.id);
            } else {
              onDownloadBook(
                activeMood.bookTitle,
                activeMood.author,
                activeMood.downloadUrl,
                activeMood.coverUrl
              );
            }
          }}
          disabled={isDownloading}
          style={[
            styles.moodActionBtn,
            {
              backgroundColor: inLibrary ? colors.canvas : colors.accent,
              borderColor: inLibrary ? colors.border : colors.accent,
              borderWidth: inLibrary ? 1 : 0,
            },
          ]}
          activeOpacity={0.8}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.isDark ? '#000000' : '#FFFFFF'} />
          ) : inLibrary ? (
            <>
              <CheckCircle2 size={13} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={[styles.moodActionBtnText, { color: colors.textPrimary }]}>
                In Your Library · Read Now
              </Text>
            </>
          ) : (
            <>
              <Download
                size={13}
                color={colors.isDark ? '#000000' : '#FFFFFF'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.moodActionBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                1-Tap Add to Library (Free Public Domain)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  moodPillsRow: {
    gap: 8,
    paddingBottom: 10,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodPillText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  moodCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodCover: {
    width: 48,
    height: 72,
    borderRadius: 6,
  },
  moodCoverFallback: {
    width: 48,
    height: 72,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodDetails: {
    marginLeft: 14,
    flex: 1,
  },
  moodThemeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  moodThemeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  moodBookTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  moodBookAuthor: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
    marginTop: 2,
  },
  moodReasonText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  moodActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  moodActionBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
});
