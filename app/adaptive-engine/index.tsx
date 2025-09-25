/**
 * Adaptive Engine Storage Viewer
 * 
 * Simple localStorage viewer for debugging adaptive engine storage issues.
 * Shows raw JSON data from all storage keys without complex imports.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { layoutStyles, buttonStyles, colors, spacing } from '@/src/design';

// Storage keys used by the adaptive engine
const STORAGE_KEYS = {
  // Adaptive engine keys
  'gm_user_profile': 'User Profile & Session Data',
  'gm_behavioral_sig': 'Behavioral Patterns',
  'gm_puzzle_perf': 'Puzzle Performance Data',
  'gm_puzzle_dnas': 'Puzzle DNA Analysis',
  // 'gm_learning_metrics': 'Learning Analytics', // REMOVED: Now computed on-demand from session history
  'gm_session_hist': 'Session History',
  'gm_powerup_data': 'Power-up Data',
  // Main game key for comparison
  'giftedMinds_highScore': 'Main Game High Score'
};

interface StorageData {
  [key: string]: {
    data: any;
    size: number;
    exists: boolean;
  };
}

const AdaptiveEngineStorageViewer = function AdaptiveEngineStorageViewer() {
  const [storageData, setStorageData] = useState<StorageData>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load all storage data
  const loadStorageData = useCallback(async () => {
    setLoading(true);
    const data: StorageData = {};

    for (const [key] of Object.entries(STORAGE_KEYS)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          data[key] = {
            data: JSON.parse(stored),
            size: stored.length,
            exists: true
          };
        } else {
          data[key] = {
            data: null,
            size: 0,
            exists: false
          };
        }
      } catch (error) {
        data[key] = {
          data: `Error parsing JSON: ${error instanceof Error ? error.message : String(error)}`,
          size: 0,
          exists: false
        };
      }
    }

    setStorageData(data);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      loadStorageData();
    }
  }, [loadStorageData]);

  // Web-only page
  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgrounds.primary }}>
        <Text style={{ color: colors.text.white, fontSize: 18, textAlign: 'center', paddingHorizontal: 20 }}>
          🖥️ Storage Viewer{'\n'}
          Available on web only{'\n\n'}
          Visit: localhost:8084/adaptive-engine
        </Text>
      </SafeAreaView>
    );
  }

  // Toggle section expansion
  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  // Clear specific storage key
  const clearStorageKey = (key: string) => {
    if (confirm(`Clear storage key: ${key}?`)) {
      localStorage.removeItem(key);
      loadStorageData();
    }
  };

  // Clear all adaptive engine data
  const clearAllAdaptiveData = () => {
    if (confirm('Clear ALL adaptive engine data? This cannot be undone.')) {
      Object.keys(STORAGE_KEYS).forEach(key => {
        if (key.startsWith('gm_')) {
          localStorage.removeItem(key);
        }
      });
      loadStorageData();
    }
  };

  // Format JSON with basic syntax highlighting
  const formatJSON = (data: any): string => {
    if (data === null) return 'null';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  // Get storage summary
  const getStorageSummary = () => {
    const totalKeys = Object.keys(storageData).length;
    const existingKeys = Object.values(storageData).filter(item => item.exists).length;
    const totalSize = Object.values(storageData).reduce((sum, item) => sum + item.size, 0);
    return { totalKeys, existingKeys, totalSize };
  };


  const screenStyles = layoutStyles.screen(0);
  const sectionStyles = layoutStyles.section(0);
  const summary = getStorageSummary();

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={screenStyles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={sectionStyles.content}>
            {/* Header */}
            <View style={{ 
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8
            }}>
              <Text style={{ 
                color: colors.text.white, 
                fontSize: 24, 
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: spacing.md
              }}>
                🗄️ localStorage Viewer
              </Text>
              
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: 14, 
                textAlign: 'center',
                marginBottom: spacing.md
              }}>
                Raw storage data viewer for debugging adaptive engine issues
              </Text>

              {/* Summary */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around',
                marginBottom: spacing.md
              }}>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  Keys: {summary.existingKeys}/{summary.totalKeys}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  Size: {summary.totalSize} bytes
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  Updated: {lastRefresh.toLocaleTimeString()}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <Pressable
                  style={[buttonStyles.primary(0, 'default').container, { minWidth: 100 }]}
                  onPress={loadStorageData}
                  disabled={loading}
                >
                  <Text style={buttonStyles.primary(0, 'default').text}>
                    {loading ? '⏳' : '🔄'} Refresh
                  </Text>
                </Pressable>

                <Pressable
                  style={[buttonStyles.primary(0, 'default').container, { minWidth: 100 }]}
                  onPress={clearAllAdaptiveData}
                >
                  <Text style={buttonStyles.primary(0, 'default').text}>
                    🗑️ Clear All
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Storage sections */}
            {Object.entries(STORAGE_KEYS).map(([key, description]) => {
              const item = storageData[key];
              const isExpanded = expandedSections.has(key);
              
              return (
                <View key={key} style={{ 
                  marginBottom: spacing.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 8,
                  overflow: 'hidden'
                }}>
                  {/* Section header */}
                  <Pressable
                    style={{
                      padding: spacing.md,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: item?.exists ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
                    }}
                    onPress={() => toggleSection(key)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: colors.text.white, 
                        fontSize: 16, 
                        fontWeight: 'bold' 
                      }}>
                        {isExpanded ? '▼' : '▶'} {key}
                      </Text>
                      <Text style={{ 
                        color: colors.text.secondary, 
                        fontSize: 12,
                        marginTop: 2
                      }}>
                        {description} • {item?.exists ? `${item.size} bytes` : 'No data'}
                      </Text>
                    </View>
                    
                    {item?.exists && (
                      <Pressable
                        style={{
                          backgroundColor: 'rgba(255, 0, 0, 0.2)',
                          padding: 6,
                          borderRadius: 4,
                          marginLeft: spacing.sm
                        }}
                        onPress={(e) => {
                          e.stopPropagation();
                          clearStorageKey(key);
                        }}
                      >
                        <Text style={{ color: colors.text.white, fontSize: 12 }}>🗑️</Text>
                      </Pressable>
                    )}
                  </Pressable>

                  {/* Section content */}
                  {isExpanded && (
                    <View style={{ 
                      padding: spacing.md,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)'
                    }}>
                      {item?.exists ? (
                        <ScrollView horizontal>
                          <Text style={{ 
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: colors.text.secondary,
                            lineHeight: 14
                          }}>
                            {formatJSON(item.data)}
                          </Text>
                        </ScrollView>
                      ) : (
                        <Text style={{ 
                          color: colors.text.secondary, 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: spacing.md
                        }}>
                          No data stored
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Debugging Info */}
            <View style={{ 
              marginTop: spacing.lg,
              padding: spacing.md,
              backgroundColor: 'rgba(255, 255, 0, 0.1)',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 0, 0.3)'
            }}>
              <Text style={{ 
                color: colors.text.white, 
                fontSize: 14, 
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: spacing.sm
              }}>
                🔍 Debugging Tips
              </Text>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: 11, 
                textAlign: 'left',
                lineHeight: 16
              }}>
                If storage keys are empty, check browser console for:{'\n'}
                • &quot;🔵 useEffect for adaptive engine initialization is running...&quot;{'\n'}
                • &quot;🧠 ON&quot; indicator should show in top-right of main game{'\n'}
                • &quot;🔄 Adaptive engine tracking triggered...&quot; when playing{'\n'}
                • &quot;💾 Puzzle DNA stored...&quot; when starting new puzzles{'\n'}
                • &quot;💾 Interaction session stored...&quot; when completing puzzles{'\n\n'}
                
                To generate data: Play a few puzzles and answer them (correctly or incorrectly). 
                Each completed puzzle should create entries in multiple storage keys.
              </Text>
            </View>

            {/* Footer */}
            <View style={{ 
              marginTop: spacing.md,
              padding: spacing.md,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 8
            }}>
              <Text style={{ 
                color: colors.text.secondary, 
                fontSize: 12, 
                textAlign: 'center'
              }}>
                💡 Click section headers to expand/collapse{'\n'}
                🔄 Refresh to see latest data{'\n'}
                🗑️ Individual clear buttons or Clear All for reset
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AdaptiveEngineStorageViewer;