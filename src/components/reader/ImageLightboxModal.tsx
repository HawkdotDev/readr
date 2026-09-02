import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { X, Share2, ZoomIn } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { FONTS } from '../../utils/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ImageLightboxModalProps {
  visible: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  visible,
  imageSrc,
  imageAlt,
  imageCaption,
  onClose,
}) => {
  if (!visible || !imageSrc) return null;

  const handleShare = async () => {
    try {
      if (imageSrc.startsWith('data:')) {
        const cacheDir = (FileSystem as any).cacheDirectory || '';
        const tempUri = `${cacheDir}shared_illustration_${Date.now()}.png`;
        const base64Data = imageSrc.split(',')[1] || imageSrc;
        await FileSystem.writeAsStringAsync(tempUri, base64Data, {
          encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri);
        }
      } else if (imageSrc.startsWith('file://') || imageSrc.startsWith('http')) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageSrc);
        }
      }
    } catch (e) {
      console.warn('Share illustration error:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeContainer}>
          {/* Top Bar with actions */}
          <View style={styles.topBar}>
            <View style={styles.titleContainer}>
              <ZoomIn size={16} color="#A1A1AA" />
              <Text style={styles.titleText} numberOfLines={1}>
                Illustration
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.iconBtn}
                accessible={true}
                accessibilityLabel="Share Image"
              >
                <Share2 size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.iconBtn, styles.closeBtn]}
                accessible={true}
                accessibilityLabel="Close Lightbox"
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Zoomable Image Viewport */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={3.5}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent={true}
          >
            <Image
              source={{ uri: imageSrc }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          </ScrollView>

          {/* Bottom Caption Pill if available */}
          {(imageCaption || imageAlt) && (
            <View style={styles.captionPill}>
              <Text style={styles.captionText}>
                {imageCaption || imageAlt}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.94)',
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: FONTS.mono.medium,
    fontSize: 13,
    color: '#A1A1AA',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  scrollArea: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: SCREEN_WIDTH * 0.92,
    height: SCREEN_HEIGHT * 0.72,
  },
  captionPill: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  captionText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#E4E4E7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
