import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Sheet } from '../common/Sheet';
import { Slider } from '../common/Slider';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { AlignLeft, AlignJustify } from 'lucide-react-native';

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
    { label: 'Literata', value: 'Literata' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Atkinson', value: 'Atkinson Hyperlegible' },
    { label: 'JetBrains Mono', value: 'JetBrains Mono' },
    { label: 'System', value: 'System' },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title="Typography & Layout">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Font Family Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }] as any}>TYPEFACE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
          {fontOptions.map((f) => {
            const isActive = fontFamily === f.value;
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
                <Text style={[styles.fontChipText, { color: isActive ? '#FFFFFF' : colors.textPrimary }] as any}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Text Alignment */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }] as any}>ALIGNMENT</Text>
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
            <Text style={[styles.alignBtnText, { color: textAlign === 'left' ? '#FFFFFF' : colors.textPrimary }] as any}>
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
            <Text style={[styles.alignBtnText, { color: textAlign === 'justify' ? '#FFFFFF' : colors.textPrimary }] as any}>
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
