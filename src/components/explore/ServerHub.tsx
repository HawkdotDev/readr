import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Globe, Server, ChevronDown, Search, Plus, X, RefreshCw } from 'lucide-react-native';
import { OPDSServer } from '../../types';
import { useTheme } from '../common/ThemeProvider';
import { FONTS } from '../../utils/typography';
import * as Haptics from 'expo-haptics';

export interface ServerHubProps {
  serverCategory: 'default' | 'custom' | 'all';
  selectedServer: OPDSServer | null;
  visibleServers: OPDSServer[];
  isServerSearchOpen: boolean;
  searchQuery: string;
  catalogError: string | null;
  onOpenCategoryDropdown: () => void;
  onToggleSearch: () => void;
  onChangeSearchQuery: (query: string) => void;
  onSubmitSearch: () => void;
  onSelectServer: (server: OPDSServer) => void;
  onLongPressServer?: (server: OPDSServer) => void;
  onOpenAddServer: () => void;
  onRefreshServer: () => void;
}

export const ServerHub: React.FC<ServerHubProps> = React.memo(({
  serverCategory,
  selectedServer,
  visibleServers,
  isServerSearchOpen,
  searchQuery,
  catalogError,
  onOpenCategoryDropdown,
  onToggleSearch,
  onChangeSearchQuery,
  onSubmitSearch,
  onSelectServer,
  onLongPressServer,
  onOpenAddServer,
  onRefreshServer,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Feed Category Dropdown Button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onOpenCategoryDropdown();
          }}
          style={[
            styles.dropdownBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          accessible={true}
          accessibilityLabel="Select Feed Category"
        >
          <Globe size={13} color={colors.accent} style={{ marginRight: 6 }} />
          <Text
            style={[styles.dropdownBtnText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {serverCategory === 'default'
              ? 'Default Servers'
              : serverCategory === 'custom'
                ? 'Custom Servers'
                : 'All Servers'}
          </Text>
          <ChevronDown size={13} color={colors.textSecondary} style={{ marginLeft: 5 }} />
        </TouchableOpacity>

        {/* Search Toggle Button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onToggleSearch();
          }}
          style={[
            styles.searchToggleBtn,
            {
              backgroundColor: colors.surface,
              borderColor: isServerSearchOpen ? colors.accent : colors.border,
            },
          ]}
          accessible={true}
          accessibilityLabel="Toggle Server Search"
        >
          <Search
            size={14}
            color={isServerSearchOpen ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Visible Server Pills */}
      {visibleServers.length === 0 ? (
        <View
          style={[
            styles.noServersContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.noServersText, { color: colors.textSecondary }]}>
            No custom servers added yet.
          </Text>
          <TouchableOpacity
            onPress={onOpenAddServer}
            style={[styles.inlineAddBtn, { backgroundColor: colors.accent }]}
          >
            <Plus
              size={12}
              color={colors.isDark ? '#000000' : '#FFFFFF'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.inlineAddText,
                { color: colors.isDark ? '#000000' : '#FFFFFF' },
              ]}
            >
              Add Feed
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {visibleServers.map((server) => {
            const isSelected = selectedServer?.id === server.id;

            return (
              <TouchableOpacity
                key={server.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onSelectServer(server);
                }}
                onLongPress={() => onLongPressServer && onLongPressServer(server)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Server
                  size={13}
                  color={
                    isSelected
                      ? colors.isDark
                        ? '#000000'
                        : '#FFFFFF'
                      : colors.textSecondary
                  }
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isSelected
                        ? colors.isDark
                          ? '#000000'
                          : '#FFFFFF'
                        : colors.textPrimary,
                      fontFamily: isSelected ? FONTS.mona.bold : FONTS.mona.medium,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {server.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Collapsible OPDS Search Bar */}
      {isServerSearchOpen && (
        <View
          style={[
            styles.searchBarBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={15} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder={`Search ${selectedServer?.title || 'catalog'}...`}
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            returnKeyType="search"
            onSubmitEditing={onSubmitSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeSearchQuery('')}
              style={styles.clearBtn}
              accessible={true}
              accessibilityLabel="Clear Search"
            >
              <X size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onRefreshServer();
            }}
            style={styles.refreshBtn}
            accessible={true}
            accessibilityLabel={`Refresh ${selectedServer?.title || ''} Catalog`}
          >
            <RefreshCw size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Error Banner */}
      {catalogError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Feed connection failed. Displaying curated public domain catalog.
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  dropdownBtnText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 12,
  },
  searchToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  noServersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  noServersText: {
    fontSize: 12,
  },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  inlineAddText: {
    fontFamily: FONTS.mona.bold,
    fontSize: 11.5,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  refreshBtn: {
    padding: 4,
    marginLeft: 6,
  },
  errorBanner: {
    backgroundColor: '#EF444418',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
});
