import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Sheet } from '../common/Sheet';
import { useTheme } from '../common/ThemeProvider';
import { useReaderStore } from '../../store/readerStore';
import {
  UserCheck,
  Plus,
  Trash2,
  Sparkles,
  Database,
  ArrowRight,
  CaseSensitive,
  WholeWord,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../utils/typography';
import {
  applyNameReplacements,
  NAME_REPLACEMENT_PRESETS,
} from '../../utils/nameReplacer';
import {
  saveBookNameReplacement,
  deleteBookNameReplacement,
  toggleBookNameReplacement,
  clearBookNameReplacements,
  saveAllBookNameReplacements,
} from '../../db/queries/nameReplacements';
import { NameReplacementRule } from '../../types';

export interface NameReplacementModalProps {
  visible: boolean;
  bookId: string;
  onClose: () => void;
}

export function NameReplacementModal({
  visible,
  bookId,
  onClose,
}: NameReplacementModalProps) {
  const { colors } = useTheme();
  const {
    nameReplacements,
    setNameReplacements,
    addNameReplacement,
    removeNameReplacement,
    toggleNameReplacement: toggleStoreRule,
  } = useReaderStore();

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);
  const [previewCustomText, setPreviewCustomText] = useState(
    'Sherlock Holmes smiled at Dr. Watson with keen curiosity and great composure.'
  );

  const activeRulesCount = useMemo(
    () => nameReplacements.filter((r) => r.isActive).length,
    [nameReplacements]
  );

  const handleAddRule = async () => {
    if (!findText.trim() || !replaceText.trim()) {
      Alert.alert('Incomplete Rule', 'Please provide both a search name/term and replacement.');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const saved = await saveBookNameReplacement(bookId, {
      findText: findText.trim(),
      replaceText: replaceText.trim(),
      matchCase,
      wholeWord,
      isActive: true,
    });

    if (saved) {
      addNameReplacement(saved);
      setFindText('');
      setReplaceText('');
    }
  };

  const handleToggleRule = async (rule: NameReplacementRule) => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    toggleStoreRule(rule.id);
    await toggleBookNameReplacement(rule.id, !rule.isActive);
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    removeNameReplacement(id);
    await deleteBookNameReplacement(id);
  };

  const handleApplyPreset = async (presetId: string) => {
    const preset = NAME_REPLACEMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const savedRules = await saveAllBookNameReplacements(
      bookId,
      preset.rules.map((r) => ({
        findText: r.findText,
        replaceText: r.replaceText,
        matchCase: r.matchCase,
        wholeWord: r.wholeWord,
        isActive: r.isActive,
      }))
    );

    setNameReplacements(savedRules);
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Replacements',
      'Remove all name replacement rules for this book?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch {}
            setNameReplacements([]);
            await clearBookNameReplacements(bookId);
          },
        },
      ]
    );
  };

  const livePreviewResult = useMemo(() => {
    return applyNameReplacements(previewCustomText, nameReplacements);
  }, [previewCustomText, nameReplacements]);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Role Reversal & Name Replacer"
      maxHeightRatio={0.9}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        {/* Header Description Badge */}
        <View style={[styles.infoBanner, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <UserCheck size={18} color={colors.accent} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoBannerTitle, { color: colors.textPrimary }]}>
              Dynamic Character Substitution
            </Text>
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>
              Alters names and terminology on-the-fly across the reading stream without modifying underlying e-book files.
            </Text>
          </View>
        </View>

        {/* Quick Presets Carousel */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={14} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Role Reversal Presets
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.presetsRow}
          >
            {NAME_REPLACEMENT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleApplyPreset(preset.id)}
                style={[
                  styles.presetCard,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.border,
                  },
                ]}
                accessible={true}
                accessibilityLabel={`Apply preset ${preset.label}`}
              >
                <Text style={[styles.presetCardTitle, { color: colors.textPrimary }]}>
                  {preset.label}
                </Text>
                <Text
                  style={[styles.presetCardDesc, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {preset.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add New Rule Form */}
        <View style={[styles.addCard, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <Text style={[styles.addCardTitle, { color: colors.textPrimary }]}>
            Add Custom Find & Replace Pair
          </Text>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Original Name / Term</Text>
              <TextInput
                value={findText}
                onChangeText={setFindText}
                placeholder="e.g. Sherlock"
                placeholderTextColor={colors.textSecondary + '80'}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.arrowIconWrapper}>
              <ArrowRight size={18} color={colors.textSecondary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Name / Term</Text>
              <TextInput
                value={replaceText}
                onChangeText={setReplaceText}
                placeholder="e.g. Detective Alex"
                placeholderTextColor={colors.textSecondary + '80'}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Options: Match Case & Whole Word Toggles */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setMatchCase((prev) => !prev)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: matchCase ? colors.accent : colors.surface,
                  borderColor: matchCase ? colors.accent : colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel="Toggle Match Case"
            >
              <CaseSensitive
                size={14}
                color={matchCase ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.optionChipText,
                  {
                    color: matchCase ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                    fontFamily: matchCase ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                Match Case
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setWholeWord((prev) => !prev)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: wholeWord ? colors.accent : colors.surface,
                  borderColor: wholeWord ? colors.accent : colors.border,
                },
              ]}
              accessible={true}
              accessibilityLabel="Toggle Whole Word Boundary"
            >
              <WholeWord
                size={14}
                color={wholeWord ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.optionChipText,
                  {
                    color: wholeWord ? (colors.isDark ? '#000000' : '#FFFFFF') : colors.textSecondary,
                    fontFamily: wholeWord ? FONTS.mona.bold : FONTS.mona.medium,
                  },
                ]}
              >
                Whole Word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddRule}
              style={[
                styles.addRuleBtn,
                {
                  backgroundColor: colors.accent,
                  opacity: findText.trim() && replaceText.trim() ? 1 : 0.6,
                },
              ]}
              disabled={!findText.trim() || !replaceText.trim()}
              accessible={true}
              accessibilityLabel="Add Replacement Rule"
            >
              <Plus size={16} color={colors.isDark ? '#000000' : '#FFFFFF'} style={{ marginRight: 4 }} />
              <Text
                style={[
                  styles.addRuleBtnText,
                  { color: colors.isDark ? '#000000' : '#FFFFFF' },
                ]}
              >
                Add Rule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Rules List */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Configured Rules ({activeRulesCount} Active)
            </Text>
            {nameReplacements.length > 0 && (
              <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                <Trash2 size={13} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {nameReplacements.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
              <Text style={[styles.emptyBoxText, { color: colors.textSecondary }]}>
                No replacement rules yet for this book. Add a rule above or choose a preset to get started.
              </Text>
            </View>
          ) : (
            nameReplacements.map((rule) => (
              <View
                key={rule.id}
                style={[
                  styles.ruleRow,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: rule.isActive ? colors.border : colors.border + '60',
                    opacity: rule.isActive ? 1 : 0.6,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.ruleBadgeRow}>
                    <Text style={[styles.findBadgeText, { color: colors.textPrimary }]}>
                      {rule.findText}
                    </Text>
                    <ArrowRight size={14} color={colors.textSecondary} style={{ marginHorizontal: 6 }} />
                    <Text style={[styles.replaceBadgeText, { color: colors.accent }]}>
                      {rule.replaceText}
                    </Text>
                  </View>

                  <View style={styles.ruleMetaRow}>
                    {rule.matchCase && (
                      <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>Case Sensitive</Text>
                      </View>
                    )}
                    {rule.wholeWord && (
                      <View style={[styles.metaPill, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.metaPillText, { color: colors.textSecondary }]}>Whole Word</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Active Switch */}
                <Switch
                  value={rule.isActive}
                  onValueChange={() => handleToggleRule(rule)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#FFFFFF"
                  style={{ marginRight: 8 }}
                />

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteRule(rule.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.ruleDeleteBtn}
                  accessible={true}
                  accessibilityLabel={`Delete rule ${rule.findText}`}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Live Real-Time Preview Card */}
        <View style={[styles.previewCard, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
          <View style={styles.previewHeaderRow}>
            <Text style={[styles.previewTitle, { color: colors.textSecondary }]}>
              LIVE BOOK PREVIEW
            </Text>
            <TouchableOpacity
              onPress={() =>
                setPreviewCustomText(
                  'Sherlock Holmes smiled at Dr. Watson with keen curiosity and great composure.'
                )
              }
            >
              <RotateCcw size={12} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.previewContent, { color: colors.textPrimary }]}>
            {livePreviewResult}
          </Text>
        </View>

        {/* SQLite Persistence Notice */}
        <View style={styles.persistenceFooter}>
          <Database size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.persistenceFooterText, { color: colors.textSecondary }]}>
            All rules are automatically persisted per-book in your offline SQLite vault.
          </Text>
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoBannerTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    marginBottom: 2,
  },
  infoBannerText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
    letterSpacing: -0.2,
  },
  presetsRow: {
    gap: 10,
    paddingRight: 10,
  },
  presetCard: {
    width: 170,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
    marginBottom: 4,
  },
  presetCardDesc: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  addCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  addCardTitle: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontFamily: FONTS.mona.medium,
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrowIconWrapper: {
    paddingTop: 16,
  },
  textInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 11,
  },
  addRuleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  addRuleBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtnText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 11,
    color: '#EF4444',
  },
  emptyBox: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBoxText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  ruleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  findBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  replaceBadgeText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 13,
  },
  ruleMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  metaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaPillText: {
    fontFamily: FONTS.mono.regular,
    fontSize: 9,
  },
  ruleDeleteBtn: {
    padding: 6,
  },
  previewCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontFamily: FONTS.mono.bold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  previewContent: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  persistenceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  persistenceFooterText: {
    fontFamily: FONTS.mona.regular,
    fontSize: 10,
  },
});
