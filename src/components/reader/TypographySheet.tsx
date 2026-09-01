import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import {
  AlignLeft,
  AlignJustify,
  Minus,
  Plus,
  Type,
  BookOpen,
  ArrowLeftRight,
  ArrowUpDown,
  Touchpad,
  Hand,
  SlidersHorizontal,
  Zap,
  Smartphone,
  Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { ReadingDirection, NavigationMode, PageTurnStyle } from '../../types';

export interface TypographySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function TypographySheet({ visible, onClose }: TypographySheetProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'typography' | 'experience'>('typography');

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    readingDirection,
    pageTurnStyle,
    navigationMode,
    volumeKeysTurnPages,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setMarginHorizontal,
    setTextAlign,
    setReadingDirection,
    setPageTurnStyle,
    setNavigationMode,
    setVolumeKeysTurnPages,
  } = useReaderStore();

  const fontOptions = [
    { label: 'Literata', value: 'Literata', familyName: 'Literata' },
    { label: 'Mona Sans', value: 'MonaSans-Regular', familyName: FONTS.mona.regular },
    { label: 'Hubot Sans', value: 'HubotSans-Regular', familyName: FONTS.hubot.regular },
    { label: 'Mona Mono', value: 'MonaSansMono-Regular', familyName: FONTS.mono.regular },
    { label: 'Merriweather', value: 'Merriweather', familyName: 'Merriweather' },
    { label: 'System Serif', value: 'serif', familyName: 'serif' },
    { label: 'System', value: 'System', familyName: undefined },
  ];

  const handleStepFontSize = (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setFontSize(Math.max(12, Math.min(36, fontSize + delta)));
  };

  const handleTabChange = (tab: 'typography' | 'experience') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setActiveTab(tab);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Customisation">
      {/* Top Segmented Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => handleTabChange('typography')}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 'typography' ? colors.accent : 'transparent',
            },
          ]}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'typography' }}
          accessibilityLabel="Typography Settings"
        >
          <Type
            size={15}
            color={
              activeTab === 'typography'
                ? colors.isDark
                  ? '#000000'
                  : '#FFFFFF'
                : colors.textSecondary
            }
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color:
                  activeTab === 'typography'
                    ? colors.isDark
                      ? '#000000'
                      : '#FFFFFF'
                    : colors.textSecondary,
                fontFamily: activeTab === 'typography' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Typography
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('experience')}
          style={[
            styles.tabButton,
            {
              backgroundColor: activeTab === 'experience' ? colors.accent : 'transparent',
            },
          ]}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'experience' }}
          accessibilityLabel="Reading Experience Settings"
        >
          <BookOpen
            size={15}
            color={
              activeTab === 'experience'
                ? colors.isDark
                  ? '#000000'
                  : '#FFFFFF'
                : colors.textSecondary
            }
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color:
                  activeTab === 'experience'
                    ? colors.isDark
                      ? '#000000'
                      : '#FFFFFF'
                    : colors.textSecondary,
                fontFamily: activeTab === 'experience' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Experience
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'typography' ? (
          /* ================= TYPOGRAPHY VIEW ================= */
          <View>
            {/* Font Family Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TYPEFACE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
              {fontOptions.map((f) => {
                const isActive = fontFamily === f.value || fontFamily === f.label;
                return (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setFontFamily(f.value);
                    }}
                    style={[
                      styles.fontChip,
                      {
                        backgroundColor: isActive ? colors.accent : colors.canvas,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fontChipText,
                        {
                          color: isActive ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                          fontFamily: f.familyName || FONTS.mona.medium,
                        },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick Stepper Row */}
            <View style={styles.stepperContainer}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                SIZE & SCALE
              </Text>
              <View style={styles.stepperGroup}>
                <TouchableOpacity
                  onPress={() => handleStepFontSize(-1)}
                  style={[styles.stepperBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                  accessible={true}
                  accessibilityLabel="Decrease font size"
                >
                  <Minus size={16} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.stepperValueText, { color: colors.textPrimary }]}>
                  {fontSize}pt
                </Text>

                <TouchableOpacity
                  onPress={() => handleStepFontSize(1)}
                  style={[styles.stepperBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                  accessible={true}
                  accessibilityLabel="Increase font size"
                >
                  <Plus size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Font Size Slider */}
            <Slider
              label="Continuous Font Size"
              value={fontSize}
              min={12}
              max={36}
              step={1}
              unit="pt"
              onChange={setFontSize}
              style={{ marginTop: 6 }}
            />

            {/* Text Alignment */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              ALIGNMENT
            </Text>
            <View style={styles.alignRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setTextAlign('left');
                }}
                style={[
                  styles.alignBtn,
                  {
                    backgroundColor: textAlign === 'left' ? colors.accent : colors.canvas,
                    borderColor: textAlign === 'left' ? colors.accent : colors.border,
                  },
                ]}
              >
                <AlignLeft
                  size={18}
                  color={textAlign === 'left' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.alignBtnText,
                    {
                      color: textAlign === 'left' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}
                >
                  Left
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setTextAlign('justify');
                }}
                style={[
                  styles.alignBtn,
                  {
                    backgroundColor: textAlign === 'justify' ? colors.accent : colors.canvas,
                    borderColor: textAlign === 'justify' ? colors.accent : colors.border,
                  },
                ]}
              >
                <AlignJustify
                  size={18}
                  color={textAlign === 'justify' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.alignBtnText,
                    {
                      color: textAlign === 'justify' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}
                >
                  Justified
                </Text>
              </TouchableOpacity>
            </View>

            {/* Line Height Slider */}
            <Slider
              label="Line Spacing (Vertical Rhythm)"
              value={lineHeight}
              min={1.2}
              max={2.2}
              step={0.1}
              displayFormatter={(v) => `${v.toFixed(1)}x`}
              onChange={setLineHeight}
            />

            {/* Margins Slider */}
            <Slider
              label="Reading Margins (Padding)"
              value={marginHorizontal}
              min={12}
              max={48}
              step={4}
              unit="dp"
              onChange={setMarginHorizontal}
            />
          </View>
        ) : (
          /* ================= READING EXPERIENCE VIEW ================= */
          <View>
            {/* Page Flow & Direction */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PAGE FLOW & DIRECTION</Text>
            <View style={styles.directionGrid}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setReadingDirection('horizontal');
                }}
                style={[
                  styles.directionCard,
                  {
                    backgroundColor: readingDirection === 'horizontal' ? colors.accent : colors.canvas,
                    borderColor: readingDirection === 'horizontal' ? colors.accent : colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel="Pages turn sideways (horizontal)"
              >
                <ArrowLeftRight
                  size={20}
                  color={readingDirection === 'horizontal' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
                  style={{ marginBottom: 6 }}
                />
                <Text
                  style={[
                    styles.directionCardTitle,
                    {
                      color: readingDirection === 'horizontal' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}
                >
                  Sideways
                </Text>
                <Text
                  style={[
                    styles.directionCardSub,
                    {
                      color: readingDirection === 'horizontal' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
                    },
                  ]}
                >
                  Horizontal paginated
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setReadingDirection('vertical');
                }}
                style={[
                  styles.directionCard,
                  {
                    backgroundColor: readingDirection === 'vertical' ? colors.accent : colors.canvas,
                    borderColor: readingDirection === 'vertical' ? colors.accent : colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel="Continuous top to bottom (vertical)"
              >
                <ArrowUpDown
                  size={20}
                  color={readingDirection === 'vertical' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary}
                  style={{ marginBottom: 6 }}
                />
                <Text
                  style={[
                    styles.directionCardTitle,
                    {
                      color: readingDirection === 'vertical' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                    },
                  ]}
                >
                  Top to Bottom
                </Text>
                <Text
                  style={[
                    styles.directionCardSub,
                    {
                      color: readingDirection === 'vertical' ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
                    },
                  ]}
                >
                  Continuous scroll
                </Text>
              </TouchableOpacity>
            </View>

            {/* Page Turn Method */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              PAGE TURN INTERACTION
            </Text>
            <View style={styles.navModeGrid}>
              {(
                [
                  { id: 'tap' as NavigationMode, label: 'Tap Edges', sub: 'Left / Right edge tap' },
                  { id: 'swipe' as NavigationMode, label: 'Swipe Gestures', sub: 'Drag to flip' },
                  { id: 'buttons' as NavigationMode, label: 'Screen Buttons', sub: 'Next / Prev buttons' },
                  { id: 'both' as NavigationMode, label: 'Tap & Swipe', sub: 'Flexible hybrid' },
                ] as const
              ).map((item) => {
                const isSel = navigationMode === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setNavigationMode(item.id);
                    }}
                    style={[
                      styles.navModeCard,
                      {
                        backgroundColor: isSel ? colors.accent : colors.canvas,
                        borderColor: isSel ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.navModeTitle,
                        {
                          color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.navModeSub,
                        {
                          color: isSel ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.textSecondary,
                        },
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Page Turn Style Animation */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              TRANSITION ANIMATION
            </Text>
            <View style={styles.styleChipsRow}>
              {(
                [
                  { id: 'slide' as PageTurnStyle, label: 'Slide' },
                  { id: 'curl' as PageTurnStyle, label: 'Page Curl' },
                  { id: 'fade' as PageTurnStyle, label: 'Fade' },
                  { id: 'none' as PageTurnStyle, label: 'Instant' },
                ] as const
              ).map((anim) => {
                const isSel = pageTurnStyle === anim.id;
                return (
                  <TouchableOpacity
                    key={anim.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setPageTurnStyle(anim.id);
                    }}
                    style={[
                      styles.styleChip,
                      {
                        backgroundColor: isSel ? colors.accent : colors.canvas,
                        borderColor: isSel ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.styleChipText,
                        {
                          color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                          fontFamily: isSel ? FONTS.mona.bold : FONTS.mona.medium,
                        },
                      ]}
                    >
                      {anim.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Hardware Controls */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              HARDWARE & TACTILE
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Volume Keys Turn Pages</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Use device volume rocker up/down to flip pages
                  </Text>
                </View>
                <Switch
                  value={volumeKeysTurnPages}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setVolumeKeysTurnPages(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.isDark ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}

export default TypographySheet;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabButtonText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  fontRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  fontChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 14,
    minWidth: 36,
    textAlign: 'center',
  },
  alignRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  alignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  alignBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
  },
  directionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  directionCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  directionCardSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    textAlign: 'center',
  },
  navModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navModeCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  navModeTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  navModeSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10.5,
  },
  styleChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleChipText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  toggleBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13.5,
    letterSpacing: -0.1,
  },
  toggleSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
    marginTop: 2,
  },
});
