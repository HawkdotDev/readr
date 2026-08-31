import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { HighlightColor } from '../../../types';
import { useTheme } from '../../common/ThemeProvider';

export interface ColorOption {
  name: HighlightColor;
  hex: string;
}

export const HIGHLIGHT_PALETTE: ColorOption[] = [
  { name: 'charcoal', hex: '#3F3F46' },
  { name: 'graphite', hex: '#71717A' },
  { name: 'silver', hex: '#A1A1AA' },
  { name: 'platinum', hex: '#D4D4D8' },
  { name: 'smoke', hex: '#E4E4E7' },
];

export interface ColorPickerRowProps {
  selectedColor: HighlightColor;
  onSelectColor: (color: HighlightColor) => void;
}

export const ColorPickerRow: React.FC<ColorPickerRowProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {HIGHLIGHT_PALETTE.map((c) => {
        const isSelected = selectedColor === c.name;
        return (
          <TouchableOpacity
            key={c.name}
            onPress={() => onSelectColor(c.name)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Select ${c.name} marker color`}
            style={[
              styles.colorSwatch,
              {
                backgroundColor: c.hex,
                borderWidth: isSelected ? 3 : 1,
                borderColor: isSelected ? colors.textPrimary : colors.border,
              },
            ] as any}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
