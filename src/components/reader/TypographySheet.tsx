import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { Type, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import { TypographyTab, ExperienceTab } from './typography';

export interface TypographySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function TypographySheet({ visible, onClose }: TypographySheetProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'typography' | 'experience'>('typography');

  return (
    <Sheet visible={visible} onClose={onClose} title="Customisation" maxHeightRatio={0.9}>
      {/* Top 2-Segment Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab('typography');
          }}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'typography' ? colors.accent : 'transparent' },
          ]}
        >
          <Type
            size={14}
            color={activeTab === 'typography' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'typography' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                fontFamily: activeTab === 'typography' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Typography
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab('experience');
          }}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === 'experience' ? colors.accent : 'transparent' },
          ]}
        >
          <SlidersHorizontal
            size={14}
            color={activeTab === 'experience' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'experience' ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                fontFamily: activeTab === 'experience' ? FONTS.mona.bold : FONTS.mona.medium,
              },
            ]}
          >
            Experience
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        {activeTab === 'typography' ? (
          <TypographyTab />
        ) : (
          <ExperienceTab onClose={onClose} />
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabButtonText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});

export default TypographySheet;
export const CustomisationSheet = TypographySheet;
export type CustomisationSheetProps = TypographySheetProps;
