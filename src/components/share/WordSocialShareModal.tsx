import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import { LiteraryWord } from '../../services/editorial/literaryLexiconService';
import {
  generateWordSocialPost,
  openTwitterIntent,
  openThreadsIntent,
  openWhatsAppIntent,
  copyPostText,
  captureCardImage,
  shareCardImage,
  SocialPlatform,
} from '../../services/share/socialPostService';
import {
  WordSocialCard,
  AspectRatioType,
} from './WordSocialCard';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Square,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface WordSocialShareModalProps {
  visible: boolean;
  literaryWord: LiteraryWord | null;
  onClose: () => void;
}

export const WordSocialShareModal: React.FC<WordSocialShareModalProps> = ({
  visible,
  literaryWord,
  onClose,
}) => {
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);

  // Customization States
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('3:4');
  const [themeId, setThemeId] = useState<'paper' | 'obsidian' | 'bookcloth' | 'bento'>('paper');
  const [showExample, setShowExample] = useState(true);
  const [showEtymology, setShowEtymology] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);

  // Caption Platform State
  const [captionPlatform, setCaptionPlatform] = useState<SocialPlatform>('twitter');
  const [hasCopiedCaption, setHasCopiedCaption] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  if (!visible || !literaryWord) return null;

  const currentCaption = generateWordSocialPost(literaryWord, captionPlatform);

  const handleCopyCaption = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await copyPostText(currentCaption);
      setHasCopiedCaption(true);
      setTimeout(() => setHasCopiedCaption(false), 2000);
    } catch (e) {
      console.warn('Failed to copy caption:', e);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsSharingImage(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      const uri = await captureCardImage(cardRef);
      if (!uri) {
        // Fallback to text share
        await shareCardImage('', currentCaption, `Word of the Day: ${literaryWord.word}`);
        setIsSharingImage(false);
        return;
      }

      await shareCardImage(uri, currentCaption, `Word of the Day: ${literaryWord.word}`);
    } catch (err: any) {
      Alert.alert('Share Notice', err?.message || 'Failed to share card image.');
    } finally {
      setIsSharingImage(false);
    }
  };

  const handlePostToTwitter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const tweetText = generateWordSocialPost(literaryWord, 'twitter');
    const success = await openTwitterIntent(tweetText);
    if (!success) {
      Alert.alert('Twitter / X', 'Could not open Twitter. Caption has been copied to your clipboard instead.');
      await copyPostText(tweetText);
    }
  };

  const handlePostToThreads = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const threadsText = generateWordSocialPost(literaryWord, 'threads');
    const success = await openThreadsIntent(threadsText);
    if (!success) {
      Alert.alert('Threads', 'Could not open Threads. Caption has been copied to your clipboard instead.');
      await copyPostText(threadsText);
    }
  };

  const handlePostToWhatsApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const whatsAppText = generateWordSocialPost(literaryWord, 'whatsapp');
    await openWhatsAppIntent(whatsAppText);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Top Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Sparkles size={16} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Share Word of the Day
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.closeBtn, { backgroundColor: colors.canvas, borderColor: colors.border }]}
              accessible={true}
              accessibilityLabel="Close Social Share"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Aspect Ratio Switcher */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                FORMAT & RATIO
              </Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAspectRatio('3:4');
                  }}
                  style={[
                    styles.segmentBtn,
                    aspectRatio === '3:4' && [
                      styles.segmentBtnActive,
                      { backgroundColor: colors.canvas, borderColor: colors.accent },
                    ],
                  ]}
                >
                  <Smartphone size={13} color={aspectRatio === '3:4' ? colors.accent : colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: aspectRatio === '3:4' ? colors.accent : colors.textSecondary,
                        fontFamily: aspectRatio === '3:4' ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    3:4 Portrait
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setAspectRatio('1:1');
                  }}
                  style={[
                    styles.segmentBtn,
                    aspectRatio === '1:1' && [
                      styles.segmentBtnActive,
                      { backgroundColor: colors.canvas, borderColor: colors.accent },
                    ],
                  ]}
                >
                  <Square size={13} color={aspectRatio === '1:1' ? colors.accent : colors.textSecondary} style={{ marginRight: 5 }} />
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: aspectRatio === '1:1' ? colors.accent : colors.textSecondary,
                        fontFamily: aspectRatio === '1:1' ? FONTS.mona.bold : FONTS.mona.medium,
                      },
                    ]}
                  >
                    1:1 Square
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme Style Presets */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                AESTHETIC THEME
              </Text>
              <View style={styles.themeRow}>
                {[
                  { id: 'paper', label: 'Paper', bg: '#FDFBF7', border: '#E7E0D3', text: '#1C1917' },
                  { id: 'obsidian', label: 'Obsidian', bg: '#090D16', border: '#1E293B', text: '#F8FAFC' },
                  { id: 'bookcloth', label: 'Emerald', bg: '#064E3B', border: '#047857', text: '#F0FDF4' },
                  { id: 'bento', label: 'Bento', bg: '#18181B', border: '#27272A', text: '#FAFAFA' },
                ].map((t) => {
                  const isSelected = themeId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setThemeId(t.id as any);
                      }}
                      style={[
                        styles.themePill,
                        {
                          backgroundColor: t.bg,
                          borderColor: isSelected ? colors.accent : t.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.themePillText,
                          {
                            color: t.text,
                            fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Live Interactive Card Preview */}
            <View style={styles.previewContainer}>
              <View style={styles.cardWrapper}>
                <WordSocialCard
                  ref={cardRef}
                  literaryWord={literaryWord}
                  themeId={themeId}
                  aspectRatio={aspectRatio}
                  showExample={showExample}
                  showEtymology={showEtymology}
                  showWatermark={showWatermark}
                />
              </View>
            </View>

            {/* Content Toggles */}
            <View style={styles.togglesRow}>
              <TouchableOpacity
                onPress={() => setShowExample((prev) => !prev)}
                style={[
                  styles.toggleChip,
                  {
                    backgroundColor: showExample ? `${colors.accent}1E` : colors.canvas,
                    borderColor: showExample ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.toggleChipText, { color: showExample ? colors.accent : colors.textSecondary }]}>
                  {showExample ? '✓ Example Quote' : '+ Example Quote'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowEtymology((prev) => !prev)}
                style={[
                  styles.toggleChip,
                  {
                    backgroundColor: showEtymology ? `${colors.accent}1E` : colors.canvas,
                    borderColor: showEtymology ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.toggleChipText, { color: showEtymology ? colors.accent : colors.textSecondary }]}>
                  {showEtymology ? '✓ Etymology' : '+ Etymology'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowWatermark((prev) => !prev)}
                style={[
                  styles.toggleChip,
                  {
                    backgroundColor: showWatermark ? `${colors.accent}1E` : colors.canvas,
                    borderColor: showWatermark ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.toggleChipText, { color: showWatermark ? colors.accent : colors.textSecondary }]}>
                  {showWatermark ? '✓ Watermark' : '+ Watermark'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Primary Action: Share Visual Card */}
            <TouchableOpacity
              onPress={handleShareImage}
              disabled={isSharingImage}
              style={[
                styles.primaryShareBtn,
                { backgroundColor: colors.accent },
              ]}
              accessible={true}
              accessibilityLabel="Share Card to Social Media"
            >
              {isSharingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Share2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.primaryShareBtnText}>
                {isSharingImage ? 'Preparing Image...' : 'Share Visual Card'}
              </Text>
            </TouchableOpacity>

            {/* Quick 1-Tap Social App Handoffs */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                OR POST DIRECTLY VIA INTENTS
              </Text>
              <View style={styles.socialHandoffRow}>
                <TouchableOpacity
                  onPress={handlePostToTwitter}
                  style={[styles.socialPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                >
                  <Text style={[styles.socialPillIcon, { color: colors.textPrimary }]}>𝕏</Text>
                  <Text style={[styles.socialPillLabel, { color: colors.textPrimary }]}>Post to X</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePostToThreads}
                  style={[styles.socialPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                >
                  <Text style={[styles.socialPillIcon, { color: colors.textPrimary }]}>🧵</Text>
                  <Text style={[styles.socialPillLabel, { color: colors.textPrimary }]}>Threads</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePostToWhatsApp}
                  style={[styles.socialPill, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                >
                  <Text style={[styles.socialPillIcon, { color: colors.textPrimary }]}>💬</Text>
                  <Text style={[styles.socialPillLabel, { color: colors.textPrimary }]}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pre-Written Caption & Copy Box */}
            <View style={styles.sectionBlock}>
              <View style={styles.captionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                  AUTOGENERATED POST CAPTION
                </Text>
                <TouchableOpacity
                  onPress={handleCopyCaption}
                  style={[styles.copyBtnSmall, { backgroundColor: colors.canvas, borderColor: colors.border }]}
                >
                  {hasCopiedCaption ? (
                    <Check size={12} color="#10B981" style={{ marginRight: 4 }} />
                  ) : (
                    <Copy size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.copyBtnSmallText, { color: hasCopiedCaption ? '#10B981' : colors.textSecondary }]}>
                    {hasCopiedCaption ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Platform Selector Tabs for Caption */}
              <View style={styles.captionPlatformTabs}>
                {(['twitter', 'threads', 'whatsapp'] as SocialPlatform[]).map((p) => {
                  const isActive = captionPlatform === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setCaptionPlatform(p);
                      }}
                      style={[
                        styles.captionTab,
                        isActive && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.captionTabText,
                          {
                            color: isActive ? colors.accent : colors.textSecondary,
                            fontFamily: isActive ? FONTS.mona.bold : FONTS.mona.regular,
                          },
                        ]}
                      >
                        {p === 'twitter' ? 'Twitter/X' : p === 'threads' ? 'Threads/IG' : 'WhatsApp'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.captionBox,
                  { backgroundColor: colors.canvas, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.captionContent, { color: colors.textPrimary }]}>
                  {currentCaption}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtnActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themePillText: {
    fontSize: 12,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 14,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  togglesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleChipText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11.5,
  },
  primaryShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryShareBtnText: {
    color: '#FFFFFF',
    fontFamily: FONTS.mona.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  socialHandoffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  socialPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  socialPillIcon: {
    fontSize: 13,
  },
  socialPillLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 12,
  },
  captionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  copyBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyBtnSmallText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
  },
  captionPlatformTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  captionTab: {
    paddingVertical: 6,
    marginRight: 16,
  },
  captionTabText: {
    fontSize: 12,
  },
  captionBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  captionContent: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
