import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import {
  TouchZone,
  TouchAction,
  TOUCH_ACTION_LABELS,
  DEFAULT_TOUCH_ZONE_CONFIG,
} from '../../services/reader/touchZoneService';
import {
  X,
  RotateCcw,
  Check,
  Grid,
} from 'lucide-react-native';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface TouchZoneConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TouchZoneConfigModal({ visible, onClose }: TouchZoneConfigModalProps) {
  const { colors } = useTheme();
  const { touchZoneMappings, updateTouchZoneAction, setTouchZoneMappings } = useReaderStore();
  const [selectedZone, setSelectedZone] = useState<TouchZone>('center');

  const zoneGrid: TouchZone[][] = [
    ['topLeft', 'topCenter', 'topRight'],
    ['centerLeft', 'center', 'centerRight'],
    ['bottomLeft', 'bottomCenter', 'bottomRight'],
  ];

  const zoneNames: Record<TouchZone, string> = {
    topLeft: 'Top Left',
    topCenter: 'Top Center',
    topRight: 'Top Right',
    centerLeft: 'Center Left',
    center: 'Center Screen',
    centerRight: 'Center Right',
    bottomLeft: 'Bottom Left',
    bottomCenter: 'Bottom Center',
    bottomRight: 'Bottom Right',
  };

  const actionKeys: TouchAction[] = [
    'nextPage',
    'prevPage',
    'toggleChrome',
    'bookmark',
    'dictionary',
    'search',
    'tts',
    'autoScroll',
    'readingRuler',
    'bionic',
    'theme',
    'none',
  ];

  const currentAction = touchZoneMappings[selectedZone] || 'none';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={true}
          accessibilityLabel="Dismiss Touch Zone Config"
        />
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <Grid size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>9-Zone Touch Grid</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            bounces={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Tap any zone in the screen preview to customize its tap gesture action.
            </Text>

            {/* 3x3 Interactive Phone Grid Preview */}
            <View
              style={[
                styles.phoneFrame,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.border,
                },
              ]}
            >
              {zoneGrid.map((row, rIdx) => (
                <View key={`row_${rIdx}`} style={styles.gridRow}>
                  {row.map((zone) => {
                    const isSelected = selectedZone === zone;
                    const action = touchZoneMappings[zone] || 'none';
                    const label = TOUCH_ACTION_LABELS[action]?.label || action;

                    return (
                      <TouchableOpacity
                        key={zone}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setSelectedZone(zone);
                        }}
                        style={[
                          styles.zoneCell,
                          {
                            backgroundColor: isSelected ? colors.accent : colors.surface,
                            borderColor: isSelected ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.zoneTitle,
                            {
                              color: isSelected ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textPrimary,
                            },
                          ]}
                        >
                          {zoneNames[zone]}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.zoneActionLabel,
                            {
                              color: isSelected ? (colors.isDark ? '#1F2937' : '#E5E7EB') : colors.accent,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Action Chooser for Selected Zone */}
            <View style={styles.actionSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  ACTION FOR "{zoneNames[selectedZone].toUpperCase()}"
                </Text>
              </View>

              <View style={styles.actionList}>
                {actionKeys.map((act) => {
                  const isChecked = currentAction === act;
                  const item = TOUCH_ACTION_LABELS[act];

                  return (
                    <TouchableOpacity
                      key={act}
                      activeOpacity={0.75}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        updateTouchZoneAction(selectedZone, act);
                      }}
                      style={[
                        styles.actionItem,
                        {
                          backgroundColor: isChecked ? colors.canvas : 'transparent',
                          borderColor: isChecked ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionItemText,
                          {
                            color: isChecked ? colors.accent : colors.textPrimary,
                            fontFamily: isChecked ? FONTS.mona.bold : FONTS.mona.regular,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isChecked && <Check size={16} color={colors.accent} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reset to Defaults Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                setTouchZoneMappings(DEFAULT_TOUCH_ZONE_CONFIG);
              }}
              style={[styles.resetBtn, { borderColor: colors.border }]}
            >
              <RotateCcw size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
                Reset 9-Zone Layout to Defaults
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
    paddingBottom: 40,
  },
  description: {
    fontSize: 12.5,
    marginBottom: 16,
    lineHeight: 18,
  },
  phoneFrame: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
    gap: 6,
    marginBottom: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  zoneCell: {
    flex: 1,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  zoneTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 9.5,
  },
  zoneActionLabel: {
    fontFamily: FONTS.mona.semiBold,
    fontSize: 10.5,
  },
  actionSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  actionList: {
    gap: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionItemText: {
    fontSize: 13,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  resetBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
});
