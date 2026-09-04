import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageContentFit } from 'expo-image';

export interface OptimizedImageProps extends Omit<ExpoImageProps, 'source'> {
  source?: { uri: string | null | undefined } | number | string | null;
  style?: StyleProp<any>;
  contentFit?: ImageContentFit;
  priority?: 'low' | 'normal' | 'high';
  fallback?: React.ReactNode;
}

/**
 * Ultra-performance Image component powered by expo-image.
 *
 * Benefits over standard React Native <Image>:
 * 1. Hardware texture downsampling directly to container dimensions.
 * 2. Caches on disk (LRU) rather than holding 12MB raw bitmaps in RAM.
 * 3. Automatic GPU memory release when unmounted.
 * 4. Smooth, progressive cross-fade (150ms).
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  source,
  style,
  contentFit = 'cover',
  priority = 'normal',
  fallback,
  ...rest
}) => {
  // Safe URI extraction
  let imageSource: any = null;

  if (typeof source === 'number') {
    imageSource = source;
  } else if (typeof source === 'string' && source.trim().length > 0) {
    imageSource = { uri: source };
  } else if (source && typeof source === 'object' && 'uri' in source && source.uri && source.uri.trim().length > 0) {
    imageSource = { uri: source.uri };
  }

  if (!imageSource) {
    return fallback ? <>{fallback}</> : <View style={[styles.placeholder, style]} />;
  }

  return (
    <ExpoImage
      source={imageSource}
      style={style}
      contentFit={contentFit}
      priority={priority}
      transition={150}
      cachePolicy="memory-disk"
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
});
