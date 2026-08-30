import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getContainerStyle = (): any => {
    const base: any = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
      paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.accent };
      case 'secondary':
        return { ...base, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: colors.isDark ? '#3F3F46' : '#27272A' };
    }
  };

  const getTextStyle = (): any => {
    const base: any = {
      fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return { ...base, color: colors.isDark ? '#000000' : '#FFFFFF' };
      case 'danger':
        return { ...base, color: '#FFFFFF' };
      case 'secondary':
        return { ...base, color: colors.textPrimary };
      case 'outline':
      case 'ghost':
        return { ...base, color: colors.accent };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style] as any}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.accent} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : undefined, textStyle] as any}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
