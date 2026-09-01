import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { AlignLeft, AlignJustify, AlignCenter, Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';

export interface TypographySheetProps {
  visible: boolean;
  onClose: () => void;
}

export const TypographySheet: React.FC<TypographySheetProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const {
    fontFamily,
    fontSize,
    lineHeight,
    marginHorizontal,
    textAlign,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setMarginHorizontal,
    setTextAlign,
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

  return (
    <Sheet visible={visible} onClose={onClose} title="Customisation">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Font Family Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TYPEFACE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
          {fontOptions.map((f) => {
            const isActive = fontFamily === f.value || fontFamily === f.label;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFontFamily(f.value)}
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
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>ALIGNMENT</Text>
        <View style={styles.alignRow}>
          <TouchableOpacity
            onPress={() => setTextAlign('left')}
            style={[
              styles.alignBtn,
              {
                backgroundColor: textAlign === 'left' ? colors.accent : colors.canvas,
                borderColor: textAlign === 'left' ? colors.accent : colors.border,
              },
            ]}
          >
            <AlignLeft size={18} color={textAlign === 'left' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
            <Text
              style={[
                styles.alignBtnText,
                { color: textAlign === 'left' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
              ]}
            >
              Left
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTextAlign('justify')}
            style={[
              styles.alignBtn,
              {
                backgroundColor: textAlign === 'justify' ? colors.accent : colors.canvas,
                borderColor: textAlign === 'justify' ? colors.accent : colors.border,
              },
            ]}
          >
            <AlignJustify size={18} color={textAlign === 'justify' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary} />
            <Text
              style={[
                styles.alignBtnText,
                { color: textAlign === 'justify' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary },
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
      </ScrollView>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
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
});
