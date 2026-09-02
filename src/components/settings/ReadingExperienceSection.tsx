import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Eye, Smartphone, Globe } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface ReadingExperienceSectionProps {
  keepAwake: boolean;
  onToggleKeepAwake: (val: boolean) => void;
  hapticFeedback: boolean;
  onToggleHaptics: (val: boolean) => void;
  onlineMetadataEnabled: boolean;
  onToggleOnlineMetadata: (val: boolean) => void;
}

export function ReadingExperienceSection({
  keepAwake,
  onToggleKeepAwake,
  hapticFeedback,
  onToggleHaptics,
  onlineMetadataEnabled,
  onToggleOnlineMetadata,
}: ReadingExperienceSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        READING EXPERIENCE
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Keep Awake */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Eye size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Keep Display Awake</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Prevents display sleep during active reading
            </Text>
          </View>
          <Switch
            value={keepAwake}
            onValueChange={onToggleKeepAwake}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Haptic Touch */}
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Smartphone size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Haptic Feedback</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Tactile feedback on page turns and actions
            </Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={onToggleHaptics}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Metadata Search */}
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Globe size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Online Cover & Metadata</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Auto-enrich book covers via Open Library
            </Text>
          </View>
          <Switch
            value={onlineMetadataEnabled}
            onValueChange={onToggleOnlineMetadata}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIconCol: {
    marginRight: 12,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 14,
  },
  toggleDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    marginTop: 2,
  },
});
