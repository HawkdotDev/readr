import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { Button } from '../common/Button';
import { BookOpen, Compass, PlusCircle } from 'lucide-react-native';
import { FONTS } from '../../utils/typography';

export interface EmptyLibraryProps {
  onImportPress: () => void;
  onExplorePress: () => void;
}

export const EmptyLibrary = React.memo<EmptyLibraryProps>(({ onImportPress, onExplorePress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <BookOpen size={48} color={colors.accent} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Your Library is Empty</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Your library is empty. Import an EPUB, PDF, or Markdown file from your device, or browse free public domain classics in Explore.
      </Text>

      <View style={styles.actionButtons}>
        <Button
          title="Import Local Book"
          variant="primary"
          icon={<PlusCircle size={18} color="#FFFFFF" />}
          onPress={onImportPress}
          style={styles.btn}
        />
        <Button
          title="Explore Public Classics"
          variant="secondary"
          icon={<Compass size={18} color={colors.textPrimary} />}
          onPress={onExplorePress}
          style={styles.btn}
        />
      </View>
    </View>
  );
});

export default EmptyLibrary;

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
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
});
