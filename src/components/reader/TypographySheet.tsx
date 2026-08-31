import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { AlignLeft, AlignJustify } from 'lucide-react-native';

import { FONTS, typography } from '../../utils/typography';

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
    { label: 'Mona Sans', value: 'MonaSans-Regular', familyName: FONTS.mona.regular },
    { label: 'Hubot Sans', value: 'HubotSans-Regular', familyName: FONTS.hubot.regular },
    { label: 'Mona Mono', value: 'MonaSansMono-Regular', familyName: FONTS.mono.regular },
    { label: 'Literata', value: 'Literata', familyName: 'Literata' },
    { label: 'Merriweather', value: 'Merriweather', familyName: 'Merriweather' },
    { label: 'System', value: 'System', familyName: undefined },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Typography & Layout">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Font Family Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: FONTS.mono.bold }] as any}>TYPEFACE</Text>
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
                      color: isActive ? '#FFFFFF' : colors.textPrimary,
                      fontFamily: f.familyName || FONTS.mona.medium,
                    },
                  ] as any}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Text Alignment */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16, fontFamily: FONTS.mono.bold }] as any}>ALIGNMENT</Text>
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
            <AlignLeft size={18} color={textAlign === 'left' ? '#FFFFFF' : colors.textPrimary} />
            <Text style={[styles.alignBtnText, { color: textAlign === 'left' ? '#FFFFFF' : colors.textPrimary, fontFamily: FONTS.mona.semiBold }] as any}>
              Left Aligned
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
            <AlignJustify size={18} color={textAlign === 'justify' ? '#FFFFFF' : colors.textPrimary} />
            <Text style={[styles.alignBtnText, { color: textAlign === 'justify' ? '#FFFFFF' : colors.textPrimary, fontFamily: FONTS.mona.semiBold }] as any}>
              Justified
            </Text>
          </TouchableOpacity>
        </View>

        {/* Font Size Slider */}
        <Slider
          label="Font Size"
          value={fontSize}
          min={12}
          max={34}
          step={1}
          unit="pt"
          onChange={setFontSize}
          style={{ marginTop: 12 } as any}
        />

        {/* Line Height Slider */}
        <Slider
          label="Line Spacing"
          value={lineHeight}
          min={1.2}
          max={2.2}
          step={0.1}
          displayFormatter={(v) => `${v.toFixed(1)}x`}
          onChange={setLineHeight}
        />

        {/* Margins Slider */}
        <Slider
          label="Page Margins"
          value={marginHorizontal}
          min={12}
          max={44}
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fontRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
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
    fontSize: 13,
    fontWeight: '600',
  },
});
