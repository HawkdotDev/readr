import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { Gauge, Zap, Clock, X } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface SpeedometerOverlayProps {
  currentWpm?: number;
  wordsReadSession?: number;
}

export function SpeedometerOverlay({
  currentWpm = 240,
  wordsReadSession = 1250,
}: SpeedometerOverlayProps) {
  const { colors } = useTheme();
  const { showSpeedometer, minutesLeftInChapter, setShowSpeedometer } = useReaderStore();
  const [expanded, setExpanded] = useState(false);

  if (!showSpeedometer) return null;

  // Pace label
  const getPaceCategory = (wpm: number) => {
    if (wpm < 180) return { label: 'Relaxed', color: '#10B981' };
    if (wpm < 280) return { label: 'Normal', color: colors.accent };
    if (wpm < 400) return { label: 'Fast', color: '#F59E0B' };
    return { label: 'Speed Reader', color: '#EF4444' };
  };

  const pace = getPaceCategory(currentWpm);

  return (
    <View style={styles.floatingTop}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOpacity: colors.isDark ? 0.35 : 0.1,
          },
        ]}
      >
        <Gauge size={14} color={pace.color} style={{ marginRight: 5 }} />
        <Text style={[styles.wpmText, { color: colors.textPrimary }]}>
          {currentWpm} <Text style={[styles.wpmUnit, { color: colors.textSecondary }]}>WPM</Text>
        </Text>
        <View style={[styles.statusDot, { backgroundColor: pace.color }]} />

        {expanded && (
          <TouchableOpacity
            onPress={() => setShowSpeedometer(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: 8 }}
          >
            <X size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {expanded && (
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Zap size={13} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Pace:</Text>
            <Text style={[styles.detailVal, { color: pace.color }]}>{pace.label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={13} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Chapter Finish:</Text>
            <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
              ~{minutesLeftInChapter} mins
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingTop: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 90,
    alignItems: 'flex-end',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  wpmText: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
  wpmUnit: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  detailsCard: {
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minWidth: 160,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginRight: 4,
  },
  detailVal: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11,
  },
});
