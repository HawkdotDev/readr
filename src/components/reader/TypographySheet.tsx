import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
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
  SlidersHorizontal,
  FolderPlus,
  Eye,
  Sun,
  Moon,
  Sparkles,
  ArrowLeftRight,
  ArrowUpDown,
  Smartphone,
  Columns,
  UserCheck,
} from 'lucide-react-native';

import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import {
  ReadingDirection,
  NavigationMode,
  PageTurnStyle,
  ReadingRulerMode,
  ThemeMode,
} from '../../types';
import { pickAndImportCustomFont, loadSavedCustomFonts } from '../../services/storage/fontManager';
import { TouchZoneConfigModal } from './TouchZoneConfigModal';
import { THEME_PALETTES } from '../../utils/theme';

export interface TypographySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function TypographySheet({ visible, onClose }: TypographySheetProps) {
  const { colors, themeMode, setThemeMode, warmthLevel, setWarmthLevel } = useTheme();
  const [activeTab, setActiveTab] = useState<'typography' | 'experience' | 'focus'>('typography');
  const [isImportingFont, setIsImportingFont] = useState(false);
  const [showTouchZoneModal, setShowTouchZoneModal] = useState(false);

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
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    dualPageMode,
    customFonts,
    pageTransition,
    edgeBrightnessEnabled,
    shakeToSpeechEnabled,
    tiltToTurnEnabled,
    tiltSensitivity,
    bionicReadingEnabled,
    bionicFixation,
    isAutoScrolling,
    autoScrollMode,
    autoScrollSpeed,
    showSpeedometer,
    readingRulerEnabled,
    readingRulerMode,
    readingRulerHeight,
    readingRulerOpacity,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setMarginHorizontal,
    setTextAlign,
    setReadingDirection,
    setPageTurnStyle,
    setPageTransition,
    setNavigationMode,
    setVolumeKeysTurnPages,
    setParagraphIndent,
    setParagraphSpacing,
    setDropCaps,
    setDualPageMode,
    setCustomFonts,
    addCustomFont,
    setEdgeBrightnessEnabled,
    setShakeToSpeechEnabled,
    setTiltToTurnEnabled,
    setTiltSensitivity,
    setBionicReadingEnabled,
    setBionicFixation,
    toggleAutoScroll,
    setAutoScrolling,
    setAutoScrollMode,
    setAutoScrollSpeed,
    setShowSpeedometer,
    setReadingRulerEnabled,
    setReadingRulerMode,
    setReadingRulerHeight,
    setReadingRulerOpacity,
  } = useReaderStore();

  useEffect(() => {
    loadSavedCustomFonts().then(setCustomFonts);
  }, []);

  const baseFontOptions = [
    { label: 'Literata', value: 'Literata', familyName: 'Literata' },
    { label: 'Mona Sans', value: 'MonaSans-Regular', familyName: FONTS.mona.regular },
    { label: 'Hubot Sans', value: 'HubotSans-Regular', familyName: FONTS.hubot.regular },
    { label: 'Mona Mono', value: 'MonaSansMono-Regular', familyName: FONTS.mono.regular },
    { label: 'Merriweather', value: 'Merriweather', familyName: 'Merriweather' },
    { label: 'System Serif', value: 'serif', familyName: 'serif' },
    { label: 'System', value: 'System', familyName: undefined },
  ];

  const allFontOptions = [
    ...baseFontOptions,
    ...customFonts.map((f) => ({ label: `${f} (Custom)`, value: f, familyName: f })),
  ];

  const handleImportFont = async () => {
    setIsImportingFont(true);
    const result = await pickAndImportCustomFont();
    setIsImportingFont(false);

    if (result.success && result.fontName) {
      addCustomFont(result.fontName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Font Loaded', `Successfully imported "${result.fontName}".`);
    } else if (result.error) {
      Alert.alert('Font Import Failed', result.error);
    }
  };

  const handleStepFontSize = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFontSize(Math.max(12, Math.min(36, fontSize + delta)));
  };

  const handleTabChange = (tab: 'typography' | 'experience' | 'focus') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
  };

  const themeList: { id: ThemeMode; label: string; preview: string; text: string }[] = [
    { id: 'light', label: 'Light', preview: THEME_PALETTES.light.canvas, text: THEME_PALETTES.light.textPrimary },
    { id: 'sepia', label: 'Sepia', preview: THEME_PALETTES.sepia.canvas, text: THEME_PALETTES.sepia.textPrimary },
    { id: 'dark', label: 'Dark', preview: THEME_PALETTES.dark.canvas, text: THEME_PALETTES.dark.textPrimary },
    { id: 'oled', label: 'OLED Black', preview: THEME_PALETTES.oled.canvas, text: THEME_PALETTES.oled.textPrimary },
    { id: 'forest', label: 'Forest', preview: THEME_PALETTES.forest.canvas, text: THEME_PALETTES.forest.textPrimary },
    { id: 'slate', label: 'Slate', preview: THEME_PALETTES.slate.canvas, text: THEME_PALETTES.slate.textPrimary },
    { id: 'solarizedDark', label: 'Solarized Dark', preview: THEME_PALETTES.solarizedDark.canvas, text: THEME_PALETTES.solarizedDark.textPrimary },
    { id: 'solarizedLight', label: 'Solarized Light', preview: THEME_PALETTES.solarizedLight.canvas, text: THEME_PALETTES.solarizedLight.textPrimary },
    { id: 'rosePine', label: 'Rosé Pine', preview: THEME_PALETTES.rosePine.canvas, text: THEME_PALETTES.rosePine.textPrimary },
    { id: 'nord', label: 'Nord', preview: THEME_PALETTES.nord.canvas, text: THEME_PALETTES.nord.textPrimary },
    { id: 'parchment', label: 'Parchment', preview: THEME_PALETTES.parchment.canvas, text: THEME_PALETTES.parchment.textPrimary },
    { id: 'amberGlow', label: 'Amber Glow', preview: THEME_PALETTES.amberGlow.canvas, text: THEME_PALETTES.amberGlow.textPrimary },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Customisation">
      {/* Top 3-Segment Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => handleTabChange('typography')}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'typography' ? colors.accent : 'transparent' },
          ]}
        >
          <Type
            size={14}
            color={activeTab === 'typography' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'typography' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
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
            { backgroundColor: activeTab === 'experience' ? colors.accent : 'transparent' },
          ]}
        >
          <SlidersHorizontal
            size={14}
            color={activeTab === 'experience' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'experience' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                fontFamily: activeTab === 'experience' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Experience
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabChange('focus')}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'focus' ? colors.accent : 'transparent' },
          ]}
        >
          <Eye
            size={14}
            color={activeTab === 'focus' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'focus' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                fontFamily: activeTab === 'focus' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Focus & Themes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {activeTab === 'typography' ? (
          /* ================= TAB 1: TYPOGRAPHY ================= */
          <View>
            {/* Typeface Selection */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TYPEFACE</Text>
              <TouchableOpacity
                onPress={handleImportFont}
                disabled={isImportingFont}
                style={[styles.importFontBtn, { borderColor: colors.border }]}
              >
                <FolderPlus size={13} color={colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.importFontBtnText, { color: colors.textPrimary }]}>
                  {isImportingFont ? 'Importing...' : '+ Add Custom Font'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontRow}>
              {allFontOptions.map((font) => {
                const isSelected = fontFamily === font.value;
                return (
                  <TouchableOpacity
                    key={font.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setFontFamily(font.value);
                    }}
                    style={[
                      styles.fontPill,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.canvas,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fontPillText,
                        {
                          color: isSelected
                            ? colors.isDark
                              ? '#000000'
                              : '#FFFFFF'
                            : colors.textPrimary,
                          fontFamily: font.familyName,
                        },
                      ]}
                    >
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Stepper & Continuous Slider */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              FONT SCALE
            </Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => handleStepFontSize(-1)}
                style={[styles.stepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                disabled={fontSize <= 12}
              >
                <Minus size={16} color={fontSize <= 12 ? colors.textSecondary : colors.textPrimary} />
              </TouchableOpacity>

              <View style={[styles.fontSizeDisplay, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
                <Text style={[styles.fontSizeNumber, { color: colors.textPrimary }]}>{fontSize}</Text>
                <Text style={[styles.fontSizeUnit, { color: colors.textSecondary }]}>pt</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleStepFontSize(1)}
                style={[styles.stepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                disabled={fontSize >= 36}
              >
                <Plus size={16} color={fontSize >= 36 ? colors.textSecondary : colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Slider
              label="Continuous Size"
              value={fontSize}
              min={12}
              max={36}
              step={1}
              unit="pt"
              onChange={setFontSize}
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
              max={2.4}
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

            {/* Advanced Paragraph Formatting */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              ADVANCED PARAGRAPHS
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Drop Caps</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Enlarge initial letter at chapter beginnings
                  </Text>
                </View>
                <Switch
                  value={dropCaps}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setDropCaps(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <Slider
              label="First-Line Indentation"
              value={paragraphIndent}
              min={0.0}
              max={2.0}
              step={0.25}
              displayFormatter={(v) => (v === 0 ? 'None' : `${v.toFixed(2)}em`)}
              onChange={setParagraphIndent}
            />

            <Slider
              label="Paragraph Gap Spacing"
              value={paragraphSpacing}
              min={0.5}
              max={2.0}
              step={0.25}
              displayFormatter={(v) => `${v.toFixed(2)}x`}
              onChange={setParagraphSpacing}
            />
          </View>
        ) : activeTab === 'experience' ? (
          /* ================= TAB 2: READING EXPERIENCE ================= */
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

            {/* Dual Page Mode */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              DUAL-PAGE SPREAD
            </Text>
            <View style={styles.alignRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setDualPageMode('auto');
                }}
                style={[
                  styles.alignBtn,
                  {
                    backgroundColor: dualPageMode === 'auto' ? colors.accent : colors.canvas,
                    borderColor: dualPageMode === 'auto' ? colors.accent : colors.border,
                  },
                ]}
              >
                <Columns size={16} color={dualPageMode === 'auto' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
                <Text style={[styles.alignBtnText, { color: dualPageMode === 'auto' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
                  Auto (Landscape)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setDualPageMode(dualPageMode === true ? false : true);
                }}
                style={[
                  styles.alignBtn,
                  {
                    backgroundColor: dualPageMode === true ? colors.accent : colors.canvas,
                    borderColor: dualPageMode === true ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.alignBtnText, { color: dualPageMode === true ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary }]}>
                  {dualPageMode === true ? 'Always 2-Column' : 'Single Column'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Page Turn Style Animation */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              PAGE TRANSITION DYNAMICS
            </Text>
            <View style={styles.animRow}>
              {(
                [
                  { id: 'slide' as const, label: 'Slide' },
                  { id: 'curl' as const, label: '3D Curl' },
                  { id: 'cover' as const, label: 'Cover' },
                  { id: 'fade' as const, label: 'Fade' },
                  { id: 'scroll' as const, label: 'Scroll' },
                  { id: 'none' as const, label: 'Instant' },
                ]
              ).map((anim) => {
                const isSel = pageTransition === anim.id || pageTurnStyle === anim.id;
                return (
                  <TouchableOpacity
                    key={anim.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setPageTransition(anim.id);
                      if (anim.id === 'slide' || anim.id === 'curl' || anim.id === 'fade' || anim.id === 'none') {
                        setPageTurnStyle(anim.id);
                      }
                    }}
                    style={[
                      styles.animPill,
                      {
                        backgroundColor: isSel ? colors.accent : colors.canvas,
                        borderColor: isSel ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.animPillText,
                        {
                          color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                        },
                      ]}
                    >
                      {anim.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bionic Speed Reading Engine */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              BIONIC SPEED READING
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Bionic Reading Mode</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Bolds initial word stems to guide eye fixations and speed up comprehension
                  </Text>
                </View>
                <Switch
                  value={bionicReadingEnabled}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setBionicReadingEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {bionicReadingEnabled && (
                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={[styles.drawerTitle, { color: colors.textSecondary, marginBottom: 8 }]}>FIXATION INTENSITY</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(
                      [
                        { id: 'low' as const, label: 'Low (35%)' },
                        { id: 'medium' as const, label: 'Medium (50%)' },
                        { id: 'high' as const, label: 'High (65%)' },
                      ]
                    ).map((lvl) => {
                      const isSel = bionicFixation === lvl.id;
                      return (
                        <TouchableOpacity
                          key={lvl.id}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setBionicFixation(lvl.id);
                          }}
                          style={[
                            styles.modePill,
                            {
                              backgroundColor: isSel ? colors.accent : colors.surface,
                              borderColor: isSel ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.modePillText,
                              {
                                color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                                fontFamily: isSel ? FONTS.mona.bold : FONTS.mona.medium,
                              },
                            ]}
                          >
                            {lvl.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Hands-Free Auto-Scroll & Telemetry */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              AUTO-SCROLL & TELEMETRY
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Reading Speedometer (WPM)</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Display live Words-Per-Minute gauge and pacing estimate
                  </Text>
                </View>
                <Switch
                  value={showSpeedometer}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setShowSpeedometer(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    setAutoScrolling(true);
                    onClose();
                  }}
                  style={[styles.startAutoScrollBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.startAutoScrollText, { color: colors.isDark ? '#000000' : '#FFFFFF' }]}>
                    ⚡ Start Hands-Free Auto-Scroll HUD
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 9-Zone Touch Action Mapping */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              TOUCH GESTURES & ZONES
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setShowTouchZoneModal(true);
                }}
                style={[styles.startAutoScrollBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
              >
                <Text style={[styles.startAutoScrollText, { color: colors.textPrimary }]}>
                  🎛️ Customize 9-Zone Touch Grid Actions
                </Text>
              </TouchableOpacity>

              <View style={[styles.toggleRow, { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Edge-Swipe Brightness</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Swipe left edge up/down to adjust screen brightness
                  </Text>
                </View>
                <Switch
                  value={edgeBrightnessEnabled}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setEdgeBrightnessEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Hardware & Motion Sensors */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              HARDWARE & MOTION SENSORS
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
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Shake-to-Speech (TTS)</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Shake device to toggle audio narration playback
                  </Text>
                </View>
                <Switch
                  value={shakeToSpeechEnabled}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setShakeToSpeechEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Tilt-to-Turn Pages</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Tilt device sideways to flip to next or previous page
                  </Text>
                </View>
                <Switch
                  value={tiltToTurnEnabled}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setTiltToTurnEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {tiltToTurnEnabled && (
                <View style={{ marginTop: 8 }}>
                  <Slider
                    label="Tilt Angle Sensitivity"
                    value={tiltSensitivity}
                    min={15}
                    max={45}
                    step={5}
                    unit="°"
                    onChange={setTiltSensitivity}
                  />
                </View>
              )}
            </View>

            {/* Dynamic Role Reversal & Name Replacer */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              CHARACTER MODS & ROLE REVERSAL
            </Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  useReaderStore.getState().setActiveSheet('nameReplacement');
                }}
                style={[
                  styles.startAutoScrollBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                accessible={true}
                accessibilityLabel="Open Role Reversal and Name Replacer"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <UserCheck size={16} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.startAutoScrollText, { color: colors.textPrimary }]}>
                    Open Character Name Replacer
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= TAB 3: FOCUS & 12 THEMES ================= */

          <View>
            {/* Reading Ruler Focus Tool */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>READING RULER (FOCUS TOOL)</Text>
            <View style={[styles.toggleBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Enable Focus Guide</Text>
                  <Text style={[styles.toggleSub, { color: colors.textSecondary }]}>
                    Interactive draggable line guide following reading position
                  </Text>
                </View>
                <Switch
                  value={readingRulerEnabled}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setReadingRulerEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {readingRulerEnabled && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: 11 }]}>
                  GUIDE STYLE
                </Text>
                <View style={styles.rulerModeGrid}>
                  {(
                    [
                      { id: 'underline' as ReadingRulerMode, label: 'Underline' },
                      { id: 'highlight' as ReadingRulerMode, label: 'Highlight Strip' },
                      { id: 'dimBackground' as ReadingRulerMode, label: 'Dim Mask' },
                      { id: 'dualGuide' as ReadingRulerMode, label: 'Dual Guide' },
                      { id: 'focusBox' as ReadingRulerMode, label: 'Focus Box' },
                      { id: 'laser' as ReadingRulerMode, label: 'Laser Line' },
                    ] as const
                  ).map((m) => {
                    const isSel = readingRulerMode === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setReadingRulerMode(m.id);
                        }}
                        style={[
                          styles.rulerModePill,
                          {
                            backgroundColor: isSel ? colors.accent : colors.canvas,
                            borderColor: isSel ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rulerModeText,
                            { color: isSel ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
                          ]}
                        >
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Slider
                  label="Ruler Aperture Height"
                  value={readingRulerHeight}
                  min={24}
                  max={64}
                  step={4}
                  unit="px"
                  onChange={setReadingRulerHeight}
                />

                <Slider
                  label="Ruler Intensity & Opacity"
                  value={readingRulerOpacity}
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  displayFormatter={(v) => `${Math.round(v * 100)}%`}
                  onChange={setReadingRulerOpacity}
                />
              </View>
            )}

            {/* 12 Curated Themes */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>
              12 CURATED PALETTES
            </Text>
            <View style={styles.themeGrid}>
              {themeList.map((t) => {
                const isActive = themeMode === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setThemeMode(t.id);
                    }}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: t.preview,
                        borderColor: isActive ? colors.accent : colors.border,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.themeCardTop}>
                      <View style={[styles.themeDot, { backgroundColor: t.text }]} />
                      {isActive && (
                        <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />
                      )}
                    </View>
                    <Text style={[styles.themeCardLabel, { color: t.text }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Blue Light Filter */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              BLUE LIGHT FILTER (0-95%)
            </Text>
            <Slider
              label="Night Amber Temperature"
              value={warmthLevel}
              min={0.0}
              max={1.0}
              step={0.05}
              displayFormatter={(v) => (v === 0 ? 'Off (Natural)' : `${Math.round(v * 95)}% Amber Filter`)}
              onChange={setWarmthLevel}
            />
          </View>
        )}
      </ScrollView>

      {/* 9-Zone Touch Action Mapping Modal */}
      <TouchZoneConfigModal
        visible={showTouchZoneModal}
        onClose={() => setShowTouchZoneModal(false)}
      />
    </Sheet>
  );
}

export default TypographySheet;
export const CustomisationSheet = TypographySheet;
export type CustomisationSheetProps = TypographySheetProps;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabButtonText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  importFontBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  importFontBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11,
  },
  fontRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fontPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  fontPillText: {
    fontSize: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  fontSizeNumber: {
    fontFamily: FONTS.mono.bold,
    fontSize: 18,
  },
  fontSizeUnit: {
    fontFamily: FONTS.mona.regular,
    fontSize: 13,
  },
  alignRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  alignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  alignBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13.5,
    letterSpacing: -0.2,
  },
  directionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  directionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  directionCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  directionCardSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  navModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  navModeCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  navModeTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    marginBottom: 2,
  },
  navModeSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
  },
  animRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  animPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  animPillText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 12.5,
  },
  toggleBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13.5,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11.5,
  },
  rulerModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  rulerModePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  rulerModeText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 11.5,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  themeCard: {
    width: '31%',
    padding: 10,
    borderRadius: 12,
    minHeight: 62,
    justifyContent: 'space-between',
  },
  themeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themeCardLabel: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
    marginTop: 6,
  },
  drawerTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  modePillText: {
    fontSize: 11.5,
  },
  startAutoScrollBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startAutoScrollText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12.5,
  },
});
