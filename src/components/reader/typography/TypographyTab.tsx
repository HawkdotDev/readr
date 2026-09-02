import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Slider } from '../../common/Slider';
import { useTheme } from '../../common/ThemeProvider';
import { useReaderStore } from '../../../store/readerStore';
import {
  AlignLeft,
  AlignJustify,
  Minus,
  Plus,
  FolderPlus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../../utils/typography';
import { pickAndImportCustomFont } from '../../../services/storage/fontManager';

export function TypographyTab() {
  const { colors } = useTheme();
  const [isImportingFont, setIsImportingFont] = useState(false);

  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    paragraphIndent,
    paragraphSpacing,
    dropCaps,
    customFonts,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setMarginHorizontal,
    setTextAlign,
    setParagraphIndent,
    setParagraphSpacing,
    setDropCaps,
    addCustomFont,
  } = useReaderStore();

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
    const next = Math.max(12, Math.min(36, fontSize + delta));
    setFontSize(next);
  };

  return (
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
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  fontSizeNumber: {
    fontFamily: FONTS.mona.bold,
    fontSize: 22,
  },
  fontSizeUnit: {
    fontFamily: FONTS.mono.regular,
    fontSize: 12,
    marginLeft: 4,
  },
  alignRow: {
    flexDirection: 'row',
    gap: 10,
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
    fontFamily: FONTS.mona.medium,
    fontSize: 14,
  },
  toggleBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
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
    fontSize: 14,
    marginBottom: 2,
  },
  toggleSub: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
