import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Globe, X } from 'lucide-react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';

export interface AddServerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (server: {
    title: string;
    url: string;
    username?: string;
    password?: string;
  }) => Promise<void>;
}

export const AddServerModal: React.FC<AddServerModalProps> = React.memo(({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert('Required Fields', 'Please enter both a Server Name and a valid OPDS URL.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        url: url.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
      });
      setTitle('');
      setUrl('');
      setUsername('');
      setPassword('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add custom server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.canvas, borderColor: colors.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Globe size={20} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Add OPDS / Calibre Feed
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Server Name *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. My Calibre Library"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              OPDS Feed URL *
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://my-server.com/opds"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Username (Optional)
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username if password-protected"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Password (Optional)
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password if required"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={true}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={colors.isDark ? '#000000' : '#FFFFFF'}
                />
              ) : (
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: colors.isDark ? '#000000' : '#FFFFFF' },
                  ]}
                >
                  Save & Connect Server
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  saveBtn: {
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 14,
  },
});
