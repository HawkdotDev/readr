import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../src/components/common/ThemeProvider';
import { Home, BookOpen, Compass, BarChart2, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../src/utils/typography';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function CustomFloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const { colors } = useTheme();
  const [capsuleWidth, setCapsuleWidth] = useState(0);

  // Filter visible tabs (excluding hidden index)
  const validRoutes = state.routes.filter((r) => r.name !== 'index');
  const activeTabRoute = state.routes[state.index];
  const activeValidIndex = validRoutes.findIndex((r) => r.key === activeTabRoute?.key);

  const tabCount = Math.max(1, validRoutes.length);
  const tabWidth = capsuleWidth > 0 ? (capsuleWidth - 12) / tabCount : 0;
  const animatedIndex = useSharedValue(Math.max(0, activeValidIndex));

  useEffect(() => {
    if (activeValidIndex >= 0) {
      animatedIndex.value = withSpring(activeValidIndex, {
        damping: 18,
        stiffness: 220,
      });
    }
  }, [activeValidIndex, animatedIndex]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: animatedIndex.value * tabWidth }],
    };
  });

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        onLayout={(e) => setCapsuleWidth(e.nativeEvent.layout.width)}
        style={[
          styles.capsule,
          {
            backgroundColor: colors.isDark
              ? 'rgba(39, 39, 42, 0.92)'
              : 'rgba(241, 239, 234, 0.92)',
            borderColor: colors.border,
            shadowOpacity: colors.isDark ? 0.35 : 0.08,
          },
        ]}
      >
        {/* Animated Sliding Pill Indicator */}
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.activePill,
              {
                width: tabWidth,
                backgroundColor: colors.isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
              pillAnimatedStyle,
            ]}
            pointerEvents="none"
          />
        )}
        {state.routes.map((route, index) => {
          if (route.name === 'index') return null;

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconColor = isFocused ? colors.textPrimary : colors.textSecondary;
          const label =
            options.title !== undefined
              ? options.title
              : route.name.charAt(0).toUpperCase() + route.name.slice(1);

          let icon = null;
          if (route.name === 'home') {
            icon = (
              <Home
                size={20}
                color={iconColor}
                fill={isFocused ? iconColor : 'transparent'}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            );
          } else if (route.name === 'library') {
            icon = (
              <BookOpen
                size={20}
                color={iconColor}
                fill={isFocused ? iconColor : 'transparent'}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            );
          } else if (route.name === 'explore') {
            icon = (
              <Compass
                size={20}
                color={iconColor}
                fill={isFocused ? iconColor : 'transparent'}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            );
          } else if (route.name === 'stats') {
            icon = (
              <BarChart2
                size={20}
                color={iconColor}
                fill={isFocused ? iconColor : 'transparent'}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            );
          } else if (route.name === 'settings') {
            icon = (
              <Settings
                size={20}
                color={iconColor}
                fill={isFocused ? iconColor : 'transparent'}
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || options.title || route.name}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {icon}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.textPrimary : colors.textSecondary,
                    fontFamily: isFocused ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      {/* Hidden redirect route */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '92%',
    maxWidth: 390,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 6,
  },
  activePill: {
    position: 'absolute',
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 26,
    zIndex: 1,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    letterSpacing: -0.2,
  },
});
