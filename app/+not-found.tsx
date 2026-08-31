import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/components/common/ThemeProvider';

import { FONTS } from '../src/utils/typography';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>This page does not exist.</Text>
        <Link href="/" style={[styles.link, { color: colors.accent }]}>
          <Text>Return to your Library</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: FONTS.mona.bold,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    fontFamily: FONTS.mona.semiBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
