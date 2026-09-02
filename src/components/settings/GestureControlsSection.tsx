import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import { Grid, Sun, Volume2, MoveHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { TouchZoneConfigModal } from '../reader/TouchZoneConfigModal';

export function GestureControlsSection() {
  const { colors } = useTheme();
  const [showTouchZoneModal, setShowTouchZoneModal] = useState(false);

  const {
    edgeBrightnessEnabled,
    setEdgeBrightnessEnabled,
    shakeToSpeechEnabled,
    setShakeToSpeechEnabled,
    tiltToTurnEnabled,
    setTiltToTurnEnabled,
  } = useReaderStore();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        TOUCH GESTURES & SENSORS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setShowTouchZoneModal(true);
          }}
          style={[
            styles.configBtn,
            { backgroundColor: colors.canvas, borderColor: colors.border, borderWidth: 1, marginBottom: 14 },
          ]}
        >
          <Grid size={16} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={[styles.configBtnText, { color: colors.textPrimary }]}>
            Customize 9-Zone Touch Grid Actions
          </Text>
        </TouchableOpacity>

        {/* Edge Brightness */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Sun size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Edge-Swipe Brightness</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Swipe left edge up/down to adjust display brightness
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

        {/* Shake-to-Speech */}
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Volume2 size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Shake-to-Speech (TTS)</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
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

        {/* Tilt-to-Turn */}
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 }]}>
          <View style={styles.toggleIconCol}>
            <View style={[styles.iconPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <MoveHorizontal size={15} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Tilt-to-Turn Pages</Text>
            <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
              Tilt device sideways to flip pages hands-free
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
      </View>

      <TouchZoneConfigModal
        visible={showTouchZoneModal}
        onClose={() => setShowTouchZoneModal(false)}
      />
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
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  configBtnText: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 13,
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
