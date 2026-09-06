import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import {
  BroadsheetDispatch,
  BroadsheetCategory,
  getDailyBroadsheetDispatch,
  getRandomBroadsheetDispatch,
} from '../../services/editorial/broadsheetService';
import { ttsService, TTSState } from '../../services/tts/ttsService';
import { tokenizeChapterForRSVP } from '../../utils/rsvpParser';
import { RSVPWordToken } from '../../types/rsvp';
import {
  Pause,
  Play,
  Share2,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Feather,
  Compass,
  FileText,
  Clock,
  Shuffle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface DailyBroadsheetSectionProps {
  onLogMinute?: (minutes: number) => void;
}

const DEPARTMENTS: { key: BroadsheetCategory; label: string }[] = [
  { key: 'all', label: 'All Dispatches' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'poetry', label: 'Verse & Poetry' },
  { key: 'fiction', label: 'Classics' },
  { key: 'essays', label: 'Essays & Letters' },
];

/**
 * Animated Equalizer Wave Bars for Audio Narration
 */
const AudioWaveBars: React.FC<{ isPlaying: boolean; color: string }> = ({ isPlaying, color }) => {
  const bar1 = useRef(new Animated.Value(4)).current;
  const bar2 = useRef(new Animated.Value(8)).current;
  const bar3 = useRef(new Animated.Value(5)).current;
  const bar4 = useRef(new Animated.Value(9)).current;

  useEffect(() => {
    if (!isPlaying) {
      Animated.parallel([
        Animated.timing(bar1, { toValue: 4, duration: 250, useNativeDriver: false }),
        Animated.timing(bar2, { toValue: 7, duration: 250, useNativeDriver: false }),
        Animated.timing(bar3, { toValue: 5, duration: 250, useNativeDriver: false }),
        Animated.timing(bar4, { toValue: 6, duration: 250, useNativeDriver: false }),
      ]).start();
      return;
    }

    const animateBar = (val: Animated.Value, minH: number, maxH: number, dur: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: maxH, duration: dur, useNativeDriver: false }),
          Animated.timing(val, { toValue: minH, duration: dur, useNativeDriver: false }),
        ])
      );
    };

    const a1 = animateBar(bar1, 3, 13, 380);
    const a2 = animateBar(bar2, 4, 16, 520);
    const a3 = animateBar(bar3, 2, 11, 340);
    const a4 = animateBar(bar4, 4, 15, 460);

    a1.start();
    a2.start();
    a3.start();
    a4.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, [isPlaying, bar1, bar2, bar3, bar4]);

  return (
    <View style={waveStyles.container}>
      <Animated.View style={[waveStyles.bar, { height: bar1, backgroundColor: color }]} />
      <Animated.View style={[waveStyles.bar, { height: bar2, backgroundColor: color }]} />
      <Animated.View style={[waveStyles.bar, { height: bar3, backgroundColor: color }]} />
      <Animated.View style={[waveStyles.bar, { height: bar4, backgroundColor: color }]} />
    </View>
  );
};

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 2,
    marginRight: 6,
  },
  bar: {
    width: 2.5,
    borderRadius: 1.5,
  },
});

export const DailyBroadsheetSection: React.FC<DailyBroadsheetSectionProps> = ({
  onLogMinute,
}) => {
  const { colors } = useTheme();

  // Active Dispatch State
  const [selectedCategory, setSelectedCategory] = useState<BroadsheetCategory>('all');
  const [dispatch, setDispatch] = useState<BroadsheetDispatch>(() => getDailyBroadsheetDispatch());
  const [hasLoggedRead, setHasLoggedRead] = useState(false);

  // Audio / TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // RSVP Inline Speed Reader State
  const [isRsvpMode, setIsRsvpMode] = useState(false);
  const [rsvpTokens, setRsvpTokens] = useState<RSVPWordToken[]>([]);
  const [rsvpIndex, setRsvpIndex] = useState(0);
  const [isRsvpPlaying, setIsRsvpPlaying] = useState(false);
  const [rsvpWpm, setRsvpWpm] = useState(300);
  const rsvpTimerRef = useRef<any>(null);

  // Subscribe to TTS changes
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state: TTSState) => {
      setIsPlayingAudio(state.isPlaying);
    });
    return () => {
      unsubscribe();
      ttsService.stop();
    };
  }, []);

  // Tokenize text whenever dispatch changes
  useEffect(() => {
    const tokens = tokenizeChapterForRSVP(dispatch.text);
    setRsvpTokens(tokens);
    setRsvpIndex(0);
    setIsRsvpPlaying(false);
    setHasLoggedRead(false);
    if (rsvpTimerRef.current) {
      clearTimeout(rsvpTimerRef.current);
    }
  }, [dispatch]);

  // RSVP word advancing loop
  const scheduleNextWord = useCallback(() => {
    if (rsvpIndex >= rsvpTokens.length - 1) {
      setIsRsvpPlaying(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }

    const currentToken = rsvpTokens[rsvpIndex];
    const baseIntervalMs = (60 / rsvpWpm) * 1000;
    const delay = baseIntervalMs * (currentToken?.delayMultiplier || 1.0);

    rsvpTimerRef.current = setTimeout(() => {
      setRsvpIndex((prev) => prev + 1);
    }, delay);
  }, [rsvpIndex, rsvpTokens, rsvpWpm]);

  useEffect(() => {
    if (isRsvpPlaying && isRsvpMode) {
      scheduleNextWord();
    }
    return () => {
      if (rsvpTimerRef.current) {
        clearTimeout(rsvpTimerRef.current);
      }
    };
  }, [isRsvpPlaying, isRsvpMode, rsvpIndex, scheduleNextWord]);

  // Handle Category Change
  const handleSelectCategory = (cat: BroadsheetCategory) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedCategory(cat);
    const next = getRandomBroadsheetDispatch(dispatch.id, cat);
    setDispatch(next);
  };

  // Handle Next Dispatch Shuffle
  const handleNextDispatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isPlayingAudio) {
      ttsService.stop();
    }
    const next = getRandomBroadsheetDispatch(dispatch.id, selectedCategory);
    setDispatch(next);
  };

  // Handle Audio Listen Toggle
  const handleToggleAudio = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (isPlayingAudio) {
      await ttsService.pause();
    } else {
      if (isRsvpPlaying) {
        setIsRsvpPlaying(false);
      }
      ttsService.setContent(`${dispatch.title}. By ${dispatch.author}. ${dispatch.text}`);
      await ttsService.play();
    }
  };

  // Handle Inline RSVP Mode Toggle
  const handleToggleRsvpMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isPlayingAudio) {
      ttsService.stop();
    }
    if (isRsvpMode) {
      setIsRsvpMode(false);
      setIsRsvpPlaying(false);
    } else {
      setIsRsvpMode(true);
      setRsvpIndex(0);
      setIsRsvpPlaying(true);
    }
  };

  // Handle Mark as Read / Log 1 Minute
  const handleMarkAsRead = () => {
    if (hasLoggedRead) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setHasLoggedRead(true);
    if (onLogMinute) {
      onLogMinute(1);
    }
  };

  // Handle Share Passage
  const handleShare = async () => {
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({
        title: dispatch.title,
        message: `"${dispatch.text}"\n\n— ${dispatch.author}, ${dispatch.source} (${dispatch.year})\n\nShared via Readr Broadsheet`,
      });
    } catch {}
  };

  // Extract author initials for monogram avatar
  const getAuthorInitials = (author: string) => {
    return author
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  };

  // Formatted date string for authentic editorial dateline
  const getDateline = () => {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`.toUpperCase();
  };

  // Category Kicker Tag
  const getCategoryKicker = (category: BroadsheetCategory) => {
    switch (category) {
      case 'philosophy':
        return 'PHILOSOPHY';
      case 'poetry':
        return 'VERSE & POETRY';
      case 'fiction':
        return 'CLASSICS';
      case 'essays':
        return 'ESSAYS & LETTERS';
      default:
        return 'LITERARY DISPATCH';
    }
  };

  const getDepartmentIcon = (category: BroadsheetCategory, color: string) => {
    switch (category) {
      case 'philosophy':
        return <Compass size={12} color={color} style={{ marginRight: 5 }} />;
      case 'poetry':
        return <Feather size={12} color={color} style={{ marginRight: 5 }} />;
      case 'fiction':
        return <BookOpen size={12} color={color} style={{ marginRight: 5 }} />;
      case 'essays':
        return <FileText size={12} color={color} style={{ marginRight: 5 }} />;
      default:
        return <Sparkles size={12} color={color} style={{ marginRight: 5 }} />;
    }
  };

  // Extract drop cap letter and remaining prose
  const firstLetter = dispatch.text.charAt(0);
  const remainingText = dispatch.text.slice(1);

  const currentToken = rsvpTokens[rsvpIndex] || {
    word: '',
    prefix: '',
    orpChar: '',
    suffix: '',
    tokenIndex: 0,
    totalTokens: 1,
    delayMultiplier: 1,
  };

  return (
    <View style={styles.container}>
      {/* ─── SECTION HEADER ROW (READR STANDARD) ─── */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <Feather size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            FOLIO DISPATCH
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNextDispatch}
          style={[
            styles.shuffleBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          accessibilityLabel="Turn Folio Page"
          activeOpacity={0.8}
        >
          <Shuffle size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.shuffleBtnText, { color: colors.textSecondary }]}>
            Turn Folio
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── ENCLOSED EDITORIAL FOLIO CARD ─── */}
      <View
        style={[
          styles.folioCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowOpacity: colors.isDark ? 0.3 : 0.06,
          },
        ]}
      >
        {/* Masthead Double Rule Motif */}
        <View style={[styles.pressRuleThick, { backgroundColor: colors.border }]} />
        <View style={[styles.pressRuleThin, { backgroundColor: colors.border }]} />

        {/* Top Dateline & Category Kicker Row */}
        <View style={styles.mastheadMetaRow}>
          <Text style={[styles.datelineText, { color: colors.textSecondary }]}>
            {getDateline()} · VOL. IV
          </Text>

          <View
            style={[
              styles.kickerBadge,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              },
            ]}
          >
            <Sparkles size={9} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.kickerBadgeText, { color: colors.accent }]}>
              {getCategoryKicker(dispatch.category)}
            </Text>
          </View>
        </View>

        {/* Masthead Main Title */}
        <View style={styles.mastheadTitleBlock}>
          <Text style={[styles.mastheadTitle, { color: colors.textPrimary }]}>
            THE READR BROADSHEET
          </Text>
          <Text style={[styles.mastheadMotto, { color: colors.textSecondary }]}>
            A Daily Folio of Classical Thought, Verse & Reflection
          </Text>
        </View>

        {/* Colophon Divider with Centered Flourish */}
        <View style={styles.colophonDivider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <View style={[styles.flourishBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.flourishGlyph, { color: colors.textSecondary }]}>❦</Text>
          </View>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* ─── DEPARTMENT SELECTOR CHIPS (HORIZONTAL SCROLL) ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptScrollContent}
        >
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedCategory === dept.key;
            const activeColor = colors.isDark ? '#000000' : '#FFFFFF';
            return (
              <TouchableOpacity
                key={dept.key}
                onPress={() => handleSelectCategory(dept.key)}
                style={[
                  styles.deptChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                {getDepartmentIcon(
                  dept.key,
                  isSelected ? activeColor : colors.textSecondary
                )}
                <Text
                  style={[
                    styles.deptChipText,
                    {
                      color: isSelected ? activeColor : colors.textSecondary,
                      fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  {dept.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── ARTICLE TITLE & BYLINE ─── */}
        <View style={styles.articleHeadBlock}>
          <Text style={[styles.articleTitle, { color: colors.textPrimary }]}>
            {dispatch.title}
          </Text>

          <View style={styles.authorBylineRow}>
            <View
              style={[
                styles.authorAvatarCircle,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.authorInitialsText, { color: colors.accent }]}>
                {getAuthorInitials(dispatch.author)}
              </Text>
            </View>

            <View style={styles.authorMetaCol}>
              <Text style={[styles.authorFullName, { color: colors.textPrimary }]}>
                {dispatch.author}
              </Text>
              <Text style={[styles.sourceCitation, { color: colors.textSecondary }]}>
                <Text style={{ fontStyle: 'italic' }}>{dispatch.source}</Text> · {dispatch.year}
              </Text>
            </View>

            <View
              style={[
                styles.readTimePill,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
            >
              <Clock size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.readTimeText, { color: colors.textSecondary }]}>
                {dispatch.readTimeSeconds}s Read
              </Text>
            </View>
          </View>
        </View>

        {/* ─── MAIN PROSE OR OPTICAL RETICLE ─── */}
        {!isRsvpMode ? (
          <View style={styles.proseBlock}>
            {/* Classical Typesetting with Drop Cap */}
            <Text style={[styles.proseText, { color: colors.textPrimary }]}>
              <Text
                style={[
                  styles.dropCapLetter,
                  {
                    color: colors.accent,
                    fontFamily: FONTS.hubot.bold,
                  },
                ]}
              >
                {firstLetter}
              </Text>
              {remainingText}
            </Text>

            {/* Illuminated Marginalia Box */}
            <View
              style={[
                styles.marginaliaCallout,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                  borderLeftColor: colors.accent,
                },
              ]}
            >
              <View style={styles.marginaliaHeader}>
                <Text style={[styles.marginaliaGlyph, { color: colors.accent }]}>✦</Text>
                <Text style={[styles.marginaliaTitle, { color: colors.textSecondary }]}>
                  MARGINALIA · KEY REFLECTION
                </Text>
              </View>
              <Text style={[styles.marginaliaQuoteText, { color: colors.textPrimary }]}>
                "{dispatch.keyInsight}"
              </Text>
            </View>
          </View>
        ) : (
          /* ─── INLINE OPTICAL RETICLE SPEED-READER STREAM ─── */
          <View
            style={[
              styles.reticleStation,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Reticle Header & Live Progress */}
            <View style={styles.reticleHeaderRow}>
              <View style={styles.reticleTagRow}>
                <Zap size={11} color={colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.reticleTagText, { color: colors.accent }]}>
                  OPTICAL STREAM
                </Text>
              </View>
              <Text style={[styles.reticleProgressText, { color: colors.textSecondary }]}>
                {rsvpIndex + 1} / {rsvpTokens.length} words ({rsvpWpm} WPM)
              </Text>
            </View>

            {/* Micro Progress Bar */}
            <View style={[styles.reticleProgressBarBg, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.reticleProgressBarFill,
                  {
                    width: `${Math.min(100, Math.max(2, ((rsvpIndex + 1) / rsvpTokens.length) * 100))}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>

            {/* Focal Crosshair Chamber */}
            <View style={styles.focusChamber}>
              <View style={[styles.crosshairTick, { backgroundColor: colors.border }]} />
              <View style={styles.reticleWordRow}>
                <Text style={[styles.wordPrefix, { color: colors.textPrimary }]}>
                  {currentToken.prefix}
                </Text>
                <View
                  style={[
                    styles.orpHighlightBox,
                    {
                      backgroundColor: colors.isMonochrome
                        ? '#3F3F46'
                        : `${colors.accent}22`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.wordOrp,
                      { color: colors.isMonochrome ? '#FFFFFF' : colors.accent },
                    ]}
                  >
                    {currentToken.orpChar}
                  </Text>
                </View>
                <Text style={[styles.wordSuffix, { color: colors.textPrimary }]}>
                  {currentToken.suffix}
                </Text>
              </View>
              <View style={[styles.crosshairTick, { backgroundColor: colors.border }]} />
            </View>

            {/* Speed Preset Selector */}
            <View style={styles.speedRow}>
              <Text style={[styles.speedLabel, { color: colors.textSecondary }]}>PACE:</Text>
              {[
                { wpm: 250, label: '250 (Relaxed)' },
                { wpm: 350, label: '350 (Paced)' },
                { wpm: 450, label: '450 (Brisk)' },
              ].map((preset) => {
                const isPaceActive = rsvpWpm === preset.wpm;
                return (
                  <TouchableOpacity
                    key={preset.wpm}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setRsvpWpm(preset.wpm);
                    }}
                    style={[
                      styles.speedChip,
                      {
                        backgroundColor: isPaceActive
                          ? (colors.isMonochrome ? '#27272A' : `${colors.accent}18`)
                          : colors.surface,
                        borderColor: isPaceActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.speedChipText,
                        {
                          color: isPaceActive
                            ? (colors.isMonochrome ? '#FFFFFF' : colors.accent)
                            : colors.textSecondary,
                          fontFamily: isPaceActive ? FONTS.mono.bold : FONTS.mono.regular,
                        },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stream Controls */}
            <View style={styles.streamControlRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setRsvpIndex(0);
                  setIsRsvpPlaying(true);
                }}
                style={[styles.streamAuxBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessible={true}
                accessibilityLabel="Restart stream"
              >
                <RotateCcw size={13} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setIsRsvpPlaying(!isRsvpPlaying);
                }}
                style={[
                  styles.streamPlayBtn,
                  { backgroundColor: colors.accent },
                ]}
                accessible={true}
                accessibilityLabel={isRsvpPlaying ? 'Pause stream' : 'Start stream'}
              >
                {isRsvpPlaying ? (
                  <Pause size={14} color={colors.isDark ? '#000000' : '#FFFFFF'} />
                ) : (
                  <Play
                    size={14}
                    color={colors.isDark ? '#000000' : '#FFFFFF'}
                    fill={colors.isDark ? '#000000' : '#FFFFFF'}
                  />
                )}
                <Text
                  style={[
                    styles.streamPlayBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  {isRsvpPlaying ? 'Pause Stream' : 'Begin Stream'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── EDITORIAL MEDIA & ACTION DOCK ─── */}
        <View style={[styles.actionDock, { borderTopColor: colors.border }]}>
          <View style={styles.dockGroupLeft}>
            {/* Audio Listen */}
            <TouchableOpacity
              onPress={handleToggleAudio}
              style={[
                styles.dockBtn,
                {
                  backgroundColor: isPlayingAudio
                    ? (colors.isMonochrome ? '#27272A' : `${colors.accent}18`)
                    : colors.canvas,
                  borderColor: isPlayingAudio ? colors.accent : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <AudioWaveBars
                isPlaying={isPlayingAudio}
                color={
                  isPlayingAudio
                    ? (colors.isMonochrome ? '#FFFFFF' : colors.accent)
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.dockBtnText,
                  {
                    color: isPlayingAudio
                      ? (colors.isMonochrome ? '#FFFFFF' : colors.accent)
                      : colors.textSecondary,
                    fontFamily: isPlayingAudio ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                {isPlayingAudio ? 'Narration' : 'Listen'}
              </Text>
            </TouchableOpacity>

            {/* Speed-Read Reticle Toggle */}
            <TouchableOpacity
              onPress={handleToggleRsvpMode}
              style={[
                styles.dockBtn,
                {
                  backgroundColor: isRsvpMode
                    ? (colors.isMonochrome ? '#27272A' : `${colors.accent}18`)
                    : colors.canvas,
                  borderColor: isRsvpMode ? colors.accent : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Zap
                size={13}
                color={
                  isRsvpMode
                    ? (colors.isMonochrome ? '#FFFFFF' : colors.accent)
                    : colors.textSecondary
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.dockBtnText,
                  {
                    color: isRsvpMode
                      ? (colors.isMonochrome ? '#FFFFFF' : colors.accent)
                      : colors.textSecondary,
                    fontFamily: isRsvpMode ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                {isRsvpMode ? 'Prose View' : 'Speed-Read'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dockGroupRight}>
            {/* Log 1m Read */}
            <TouchableOpacity
              onPress={handleMarkAsRead}
              style={[
                styles.habitCreditBtn,
                {
                  backgroundColor: hasLoggedRead
                    ? (colors.isMonochrome ? '#27272A' : (colors.isDark ? '#064E3B' : '#ECFDF5'))
                    : (colors.isMonochrome ? '#18181B' : `${colors.accent}18`),
                  borderColor: hasLoggedRead
                    ? (colors.isMonochrome ? '#52525B' : (colors.isDark ? '#065F46' : '#A7F3D0'))
                    : (colors.isMonochrome ? '#3F3F46' : `${colors.accent}35`),
                },
              ]}
              activeOpacity={0.8}
            >
              {hasLoggedRead ? (
                <Check
                  size={12}
                  color={colors.isMonochrome ? '#FFFFFF' : (colors.isDark ? '#34D399' : '#047857')}
                  style={{ marginRight: 4 }}
                />
              ) : (
                <BookOpen size={12} color={colors.accent} style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.habitCreditBtnText,
                  {
                    color: hasLoggedRead
                      ? (colors.isMonochrome ? '#FFFFFF' : (colors.isDark ? '#34D399' : '#047857'))
                      : colors.accent,
                  },
                ]}
              >
                {hasLoggedRead ? 'Secured (+1m)' : 'Log 1m Read'}
              </Text>
            </TouchableOpacity>

            {/* Quick Share */}
            <TouchableOpacity
              onPress={handleShare}
              style={[
                styles.iconCircleAction,
                { backgroundColor: colors.canvas, borderColor: colors.border },
              ]}
              activeOpacity={0.8}
              accessibilityLabel="Share passage"
            >
              <Share2 size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
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
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  shuffleBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  folioCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
  pressRuleThick: {
    height: 2,
    borderRadius: 1,
    marginBottom: 2,
  },
  pressRuleThin: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  mastheadMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datelineText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 9.5,
    letterSpacing: 1.1,
  },
  kickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kickerBadgeText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  mastheadTitleBlock: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  mastheadTitle: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 18,
    letterSpacing: 2.2,
    textAlign: 'center',
    marginBottom: 2,
  },
  mastheadMotto: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  colophonDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  flourishBadge: {
    paddingHorizontal: 8,
  },
  flourishGlyph: {
    fontSize: 11,
    lineHeight: 14,
  },
  deptScrollContent: {
    gap: 7,
    paddingVertical: 4,
    marginBottom: 12,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 16,
    borderWidth: 1,
  },
  deptChipText: {
    fontSize: 11.5,
    letterSpacing: -0.1,
  },
  articleHeadBlock: {
    marginBottom: 12,
  },
  articleTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  authorBylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  authorInitialsText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
  },
  authorMetaCol: {
    flex: 1,
  },
  authorFullName: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    lineHeight: 17,
  },
  sourceCitation: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  readTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  readTimeText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  proseBlock: {
    marginBottom: 14,
  },
  proseText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  dropCapLetter: {
    fontSize: 34,
    lineHeight: 36,
    marginRight: 4,
  },
  marginaliaCallout: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3.5,
  },
  marginaliaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  marginaliaGlyph: {
    fontSize: 9,
    marginRight: 5,
  },
  marginaliaTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  marginaliaQuoteText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reticleStation: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  reticleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reticleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reticleTagText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  reticleProgressText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 10,
  },
  reticleProgressBarBg: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  reticleProgressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  focusChamber: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  crosshairTick: {
    width: 2,
    height: 8,
    borderRadius: 1,
    marginVertical: 4,
  },
  reticleWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordPrefix: {
    fontFamily: FONTS.mona.bold,
    fontSize: 24,
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  orpHighlightBox: {
    paddingHorizontal: 1,
    borderRadius: 4,
  },
  wordOrp: {
    fontFamily: FONTS.mona.bold,
    fontSize: 24,
    letterSpacing: 0.5,
  },
  wordSuffix: {
    fontFamily: FONTS.mona.bold,
    fontSize: 24,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  speedLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
    letterSpacing: 0.8,
    marginRight: 2,
  },
  speedChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  speedChipText: {
    fontSize: 10,
  },
  streamControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  streamAuxBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  streamPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streamPlayBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 2,
  },
  dockGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8.5,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dockBtnText: {
    fontSize: 11,
  },
  habitCreditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9.5,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  habitCreditBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    letterSpacing: -0.1,
  },
  iconCircleAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
