import React, { useCallback, useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { Home, BookOpen, Compass, BarChart2, Settings, Rss } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// ─── Constants & Physics ───────────────────────────────────────────────
const TAB_NAMES = ['home', 'feed', 'library', 'explore', 'stats', 'settings'] as const;
const TAB_COUNT = TAB_NAMES.length;
const CAPSULE_HEIGHT = 56;
const SQUARE_SIZE = 42;
const SQUARE_RADIUS = 12; // Distinct rounded-corner square, not a circle
const SQUARE_TOP = (CAPSULE_HEIGHT - SQUARE_SIZE) / 2; // Perfectly centered vertically
const ICON_SIZE = 20;
const FOCUSED_STROKE = 2.2;
const IDLE_STROKE = 1.6;

// Snappy, friction-tuned spring for instant UI-thread translation
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 260,
  mass: 0.5,
} as const;

// ─── Pure Icon Renderer ────────────────────────────────────────────────
function renderIcon(name: string, color: string, isFocused: boolean) {
  const strokeW = isFocused ? FOCUSED_STROKE : IDLE_STROKE;
  switch (name) {
    case 'home':
      return (
        <Home
          size={ICON_SIZE}
          color={color}
          fill={isFocused ? color : 'transparent'}
          strokeWidth={strokeW}
        />
      );
    case 'feed':
      return (
        <Rss
          size={ICON_SIZE}
          color={color}
          strokeWidth={strokeW}
        />
      );
    case 'library':
      return (
        <BookOpen
          size={ICON_SIZE}
          color={color}
          fill={isFocused ? color : 'transparent'}
          strokeWidth={strokeW}
        />
      );
    case 'explore':
      return <Compass size={ICON_SIZE} color={color} strokeWidth={strokeW} />;
    case 'stats':
      return <BarChart2 size={ICON_SIZE} color={color} strokeWidth={strokeW} />;
    case 'settings':
      return <Settings size={ICON_SIZE} color={color} strokeWidth={strokeW} />;
    default:
      return null;
  }
}

// ─── Pure Memoized Tab Item (Zero Hooks) ────────────────────────────────
interface TabItemProps {
  name: string;
  isFocused: boolean;
  iconColor: string;
  onPress: () => void;
}

const TabItem = React.memo<TabItemProps>(
  ({ name, isFocused, iconColor, onPress }) => (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : undefined}
      accessibilityLabel={name}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {renderIcon(name, iconColor, isFocused)}
    </Pressable>
  ),
  (prev, next) =>
    prev.isFocused === next.isFocused &&
    prev.iconColor === next.iconColor &&
    prev.name === next.name,
);

// ─── Floating Tab Bar ──────────────────────────────────────────────────
function CustomFloatingTabBar({
  state,
  navigation,
}: Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0]) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Deterministic, immediate dimensions — zero layout delay or jumping
  const capsuleWidth = Math.min(Math.round(windowWidth * 0.88), 372);
  const tabWidth = capsuleWidth / TAB_COUNT;
  const squareOffsetX = (tabWidth - SQUARE_SIZE) / 2;

  // Compute active valid tab index
  const activeRoute = state.routes[state.index];
  const idx = TAB_NAMES.indexOf(activeRoute?.name as any);
  const activeIdx = idx >= 0 ? idx : 0;

  // Single Reanimated shared value initialized directly at current tab offset
  const indicatorX = useSharedValue(activeIdx * tabWidth);

  useEffect(() => {
    indicatorX.value = withSpring(activeIdx * tabWidth, SPRING_CONFIG);
  }, [activeIdx, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handlePress = useCallback(
    (routeName: string, routeKey: string, isFocused: boolean) => {
      if (isFocused) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation],
  );

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.capsule,
          {
            width: capsuleWidth,
            backgroundColor: colors.surface, // Fully opaque, zero transparency
            borderColor: colors.border,
            shadowOpacity: colors.isDark ? 0.35 : 0.08,
          },
        ]}
      >
        {/* Animated Sliding Rounded-Corner Square Indicator */}
        <Animated.View
          style={[
            styles.activeSquare,
            {
              left: squareOffsetX,
              backgroundColor: colors.canvas, // 100% opaque, beautiful contrast against surface
              borderColor: colors.isDark
                ? 'rgba(255, 255, 255, 0.10)'
                : 'rgba(0, 0, 0, 0.08)',
              shadowOpacity: colors.isDark ? 0.25 : 0.06,
            },
            indicatorStyle,
          ]}
          pointerEvents="none"
        />

        {/* Tab Items */}
        {state.routes.map((route, index) => {
          if (route.name === 'index') return null;
          const isFocused = state.index === index;
          const iconColor = isFocused ? colors.accent : colors.textSecondary;

          return (
            <TabItem
              key={route.name}
              name={route.name}
              isFocused={isFocused}
              iconColor={iconColor}
              onPress={() => handlePress(route.name, route.key, isFocused)}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Tab Screens Layout ────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CAPSULE_HEIGHT,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 10,
    position: 'relative',
  },
  activeSquare: {
    position: 'absolute',
    top: SQUARE_TOP,
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: SQUARE_RADIUS, // Rounded-corner square, not a circle
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
