import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import {
  HelpCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface LiteraryPollOption {
  id: string;
  text: string;
  initialVotes: number;
}

export interface LiteraryPoll {
  id: string;
  topic: string;
  question: string;
  context: string;
  options: LiteraryPollOption[];
}

export const DEFAULT_LITERARY_POLL: LiteraryPoll = {
  id: 'poll_reading_medium',
  topic: 'DAILY LITERARY DEBATE',
  question: 'Which reading medium fosters your deepest comprehension and retention?',
  context: 'A perennial debate among bibliophiles and cognitive scientists alike.',
  options: [
    { id: 'opt_paper', text: 'Printed Books (Tactile / Paper)', initialVotes: 142 },
    { id: 'opt_digital', text: 'E-Reader / Digital Text (Clean Typography)', initialVotes: 108 },
    { id: 'opt_audio', text: 'Audiobook Narration (Aural Immersion)', initialVotes: 47 },
  ],
};

export interface LiteraryPollCardProps {
  poll?: LiteraryPoll;
  onVote?: (optionId: string) => void;
}

export const LiteraryPollCard: React.FC<LiteraryPollCardProps> = ({
  poll = DEFAULT_LITERARY_POLL,
  onVote,
}) => {
  const { colors } = useTheme();

  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    poll.options.forEach((opt) => {
      initial[opt.id] = opt.initialVotes;
    });
    return initial;
  });

  const totalPollVotes = Object.values(pollVotes).reduce((sum, count) => sum + count, 0);

  const handleVote = (optionId: string) => {
    if (votedOptionId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setVotedOptionId(optionId);
    setPollVotes((prev) => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));
    onVote?.(optionId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.eyebrowRow}>
          <HelpCircle size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>
            {poll.topic}
          </Text>
        </View>
        <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
          {totalPollVotes} votes
        </Text>
      </View>

      <View
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.pollQuestion, { color: colors.textPrimary }]}>
          {poll.question}
        </Text>
        <Text style={[styles.pollContext, { color: colors.textSecondary }]}>
          {poll.context}
        </Text>

        <View style={styles.pollOptionsList}>
          {poll.options.map((opt) => {
            const votes = pollVotes[opt.id] || 0;
            const pct = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
            const isSelected = votedOptionId === opt.id;

            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleVote(opt.id)}
                disabled={Boolean(votedOptionId)}
                style={[
                  styles.pollOptionBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)'
                      : colors.canvas,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                {votedOptionId && (
                  <View
                    style={[
                      styles.pollOptionFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: isSelected
                          ? colors.isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.1)'
                          : colors.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    ]}
                  />
                )}

                <View style={styles.pollOptionContent}>
                  <Text
                    style={[
                      styles.pollOptionText,
                      {
                        color: isSelected ? colors.textPrimary : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.text}
                  </Text>

                  {votedOptionId && (
                    <Text
                      style={[
                        styles.pollOptionPct,
                        {
                          color: isSelected ? colors.accent : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {pct}%
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontFamily: FONTS.mono.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionMeta: {
    fontFamily: FONTS.mono.medium,
    fontSize: 11,
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  pollQuestion: {
    fontFamily: FONTS.hubot.bold,
    fontSize: 17,
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 4,
  },
  pollContext: {
    fontFamily: FONTS.mona.regular,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  pollOptionsList: {
    gap: 8,
  },
  pollOptionBtn: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pollOptionFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollOptionText: {
    fontFamily: FONTS.mona.medium,
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  pollOptionPct: {
    fontFamily: FONTS.mono.bold,
    fontSize: 12,
  },
});
