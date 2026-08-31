import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Button } from '../common/Button';
import { BookOpen, Compass, PlusCircle } from 'lucide-react-native';

export interface EmptyLibraryProps {
  onImportPress: () => void;
  onExplorePress: () => void;
}

export const EmptyLibrary: React.FC<EmptyLibraryProps> = ({ onImportPress, onExplorePress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }] as any}>
        <BookOpen size={48} color={colors.accent} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }] as any}>Your Library is Empty</Text>

      <Text style={[styles.description, { color: colors.textSecondary }] as any}>
        Your library is empty. Import an EPUB, PDF, or Markdown file from your device, or browse free public domain classics in Explore.
      </Text>

      <View style={styles.actionButtons}>
        <Button
          title="Import Local Book"
          variant="primary"
          icon={<PlusCircle size={18} color="#FFFFFF" />}
          onPress={onImportPress}
          style={styles.btn as any}
        />
        <Button
          title="Explore Public Classics"
          variant="secondary"
          icon={<Compass size={18} color={colors.textPrimary} />}
          onPress={onExplorePress}
          style={styles.btn as any}
        />
      </View>
    </View>
  );
};

import { FONTS } from '../../utils/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: FONTS.mona.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
});
