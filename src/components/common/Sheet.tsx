import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from './ThemeProvider';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightRatio?: number;
  style?: ViewStyle;
}

export const Sheet: React.FC<SheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.8,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop as any} onPress={onClose}>
        <Pressable
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              maxHeight: SCREEN_HEIGHT * maxHeightRatio,
            },
            style,
          ] as any}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Grab handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }] as any} />
          </View>

          {/* Header */}
          {title ? (
            <View style={[styles.header, { borderBottomColor: colors.border }] as any}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }] as any}>{title}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
