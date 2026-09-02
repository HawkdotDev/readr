import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Slider } from '../common/Slider';
import { Target } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface ReadingGoalsSectionProps {
  targetMinutes: number;
  onUpdateTargetMinutes: (val: number) => void;
}

export function ReadingGoalsSection({
  targetMinutes,
  onUpdateTargetMinutes,
}: ReadingGoalsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        DAILY HABIT GOALS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWithIcon}>
            <Target size={16} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily Reading Target</Text>
          </View>
        </View>

        <Slider
          label="Target Minutes"
          value={targetMinutes || 30}
          min={10}
          max={120}
          step={5}
          unit=" mins/day"
          onChange={onUpdateTargetMinutes}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 15,
  },
});
