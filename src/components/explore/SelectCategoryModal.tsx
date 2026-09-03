import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Globe, Check, Plus, X } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface SelectCategoryModalProps {
  visible: boolean;
  serverCategory: 'default' | 'custom' | 'all';
  customServersCount: number;
  onSelectCategory: (category: 'default' | 'custom' | 'all') => void;
  onOpenAddServer: () => void;
  onClose: () => void;
}

export const SelectCategoryModal: React.FC<SelectCategoryModalProps> = React.memo(({
  visible,
  serverCategory,
  customServersCount,
  onSelectCategory,
  onOpenAddServer,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Globe size={18} color={colors.accent} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Select Feed Category
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity
              onPress={() => onSelectCategory('default')}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: serverCategory === 'default' ? colors.surface : 'transparent',
                  borderColor: serverCategory === 'default' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.serverTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily:
                        serverCategory === 'default' ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  Default Public Domain Servers
                </Text>
                <Text style={[styles.serverUrl, { color: colors.textSecondary }]}>
                  Standard Ebooks, Project Gutenberg & curated public catalogs
                </Text>
              </View>
              {serverCategory === 'default' && (
                <Check size={16} color={colors.accent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectCategory('custom')}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: serverCategory === 'custom' ? colors.surface : 'transparent',
                  borderColor: serverCategory === 'custom' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.serverTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily:
                        serverCategory === 'custom' ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  Custom Calibre & OPDS Feeds ({customServersCount})
                </Text>
                <Text style={[styles.serverUrl, { color: colors.textSecondary }]}>
                  Your personal Calibre libraries and private book servers
                </Text>
              </View>
              {serverCategory === 'custom' && (
                <Check size={16} color={colors.accent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectCategory('all')}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: serverCategory === 'all' ? colors.surface : 'transparent',
                  borderColor: serverCategory === 'all' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.serverTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily:
                        serverCategory === 'all' ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                >
                  All Feeds (Unified Search)
                </Text>
                <Text style={[styles.serverUrl, { color: colors.textSecondary }]}>
                  Search across all default and custom servers simultaneously
                </Text>
              </View>
              {serverCategory === 'all' && (
                <Check size={16} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              onClose();
              onOpenAddServer();
            }}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
          >
            <Plus
              size={15}
              color={colors.isDark ? '#000000' : '#FFFFFF'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.addBtnText,
                { color: colors.isDark ? '#000000' : '#FFFFFF' },
              ]}
            >
              Add Custom Feed
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 8,
    marginBottom: 14,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  serverTitle: {
    fontSize: 13.5,
  },
  serverUrl: {
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
  },
  addBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
});
