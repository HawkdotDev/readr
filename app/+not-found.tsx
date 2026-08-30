import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/components/common/ThemeProvider';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.canvas }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>This chapter does not exist.</Text>
        <Link href="/" style={[styles.link, { color: colors.accent }]}>
          <Text>Return to your Sanctuary</Text>
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
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 16,
    fontWeight: '600',
  },
});
