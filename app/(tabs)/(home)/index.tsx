
import { useTheme } from '@react-navigation/native';
import { analyzeContract as analyzeContractAPI } from '@/utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import ProgressRing from '@/components/ProgressRing';
import React, { useState } from 'react';
import BarChart from '@/components/BarChart';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/ui/Modal';
import GradientCard from '@/components/GradientCard';
import { Stack } from 'expo-router';

interface RiskItem {
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
}

interface MoneyTrap {
  title: string;
  description: string;
  amount?: string;
}

interface AutoRenewTrap {
  title: string;
  description: string;
  cancellationDifficulty: string;
}

interface DangerousClause {
  title: string;
  description: string;
  legalImpact: string;
}

interface AnalysisResult {
  id: string;
  imageUrl: string;
  extractedText: string;
  hiddenRisks: RiskItem[];
  moneyTraps: MoneyTrap[];
  autoRenewTraps: AutoRenewTrap[];
  dangerousClauses: DangerousClause[];
  createdAt: string;
}

interface ModalConfig {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success';
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });
  const { colors: themeColors } = useTheme();

  const showModal = (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
    console.log(`[Modal] Showing ${type} modal: ${title}`);
    setModalConfig({ visible: true, title, message, type });
  };

  const hideModal = () => {
    console.log('[Modal] Hiding modal');
    setModalConfig({ ...modalConfig, visible: false });
  };

  const resetToHome = () => {
    console.log('[User Action] Resetting to home screen');
    setAnalysisResult(null);
    setCapturedImages([]);
  };

  const pickImage = async () => {
    console.log('[User Action] Tapped Upload Image button');
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[Permission] Media library permission status:', status);

      if (status !== 'granted') {
        showModal(
          'Permission Required',
          'Media library access is needed to select contract images for analysis.',
          'error'
        );
        return;
      }

      console.log('[ImagePicker] Launching image library');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUris = result.assets.map(asset => asset.uri);
        console.log('[ImagePicker] Images selected:', imageUris.length);
        setCapturedImages(prev => [...prev, ...imageUris]);
      } else {
        console.log('[User Action] Image selection cancelled');
      }
    } catch (error: any) {
      console.error('[Error] Image selection failed:', error);
      showModal('Error', error.message || 'Failed to select image', 'error');
    }
  };

  const takePhoto = async () => {
    console.log('[User Action] Tapped Take Photo button');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[Permission] Camera permission status:', status);

      if (status !== 'granted') {
        showModal(
          'Permission Required',
          'Camera access is needed to take photos of contracts for analysis.',
          'error'
        );
        return;
      }

      console.log('[Permission] Camera access granted');
      console.log('[ImagePicker] Launching camera');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('[ImagePicker] Photo captured:', imageUri);
        setCapturedImages(prev => [...prev, imageUri]);
      } else {
        console.log('[User Action] Photo capture cancelled');
      }
    } catch (error: any) {
      console.error('[Error] Camera failed:', error);
      showModal('Error', error.message || 'Failed to take photo', 'error');
    }
  };

  const removeImage = (index: number) => {
    console.log('[User Action] Removing image at index:', index);
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const scanAllImages = async () => {
    console.log('[User Action] Tapped Scan All button');
    if (capturedImages.length === 0) {
      showModal('No Images', 'Please take or select at least one photo to scan.', 'info');
      return;
    }

    console.log('[API] Starting contract analysis for', capturedImages.length, 'images');
    setLoading(true);
    try {
      const firstImageUri = capturedImages[0];
      const result = await analyzeContractAPI(firstImageUri);
      console.log('[API] Analysis complete:', result);
      setAnalysisResult(result);
      showModal('Analysis Complete', 'Your contract has been analyzed successfully!', 'success');
    } catch (error: any) {
      console.error('[Error] Analysis failed:', error);
      showModal(
        'Analysis Failed',
        error.message || 'Failed to analyze contract. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: 'low' | 'medium' | 'high') => {
    const severityColorMap = {
      low: '#10B981',
      medium: '#FFB800',
      high: '#EF4444',
    };
    return severityColorMap[severity || 'low'];
  };

  const getSeverityLabel = (severity?: 'low' | 'medium' | 'high') => {
    const severityLabelMap = {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
    };
    return severityLabelMap[severity || 'low'];
  };

  const calculateRiskScore = () => {
    if (!analysisResult) return 0;
    const totalIssues =
      analysisResult.hiddenRisks.length +
      analysisResult.moneyTraps.length +
      analysisResult.autoRenewTraps.length +
      analysisResult.dangerousClauses.length;
    const maxScore = 100;
    const scorePerIssue = 10;
    const calculatedScore = Math.max(0, maxScore - totalIssues * scorePerIssue);
    return calculatedScore;
  };

  const getChartData = () => {
    if (!analysisResult) return [];
    return [
      {
        label: 'Hidden Risks',
        value: analysisResult.hiddenRisks.length,
        color: '#EF4444',
      },
      {
        label: 'Money Traps',
        value: analysisResult.moneyTraps.length,
        color: '#FFB800',
      },
      {
        label: 'Auto-Renew',
        value: analysisResult.autoRenewTraps.length,
        color: '#8B5CF6',
      },
      {
        label: 'Dangerous',
        value: analysisResult.dangerousClauses.length,
        color: '#3B82F6',
      },
    ];
  };

  const riskScore = calculateRiskScore();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>AI Terms Simplifier</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Understand Any Contract in 10 Seconds
            </Text>
          </View>

          {!analysisResult && !loading && capturedImages.length === 0 && (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={[colors.primary + '20', colors.accent + '20']}
                style={styles.emptyStateGradient}
              >
                <IconSymbol
                  ios_icon_name="doc.text.magnifyingglass"
                  android_material_icon_name="description"
                  size={80}
                  color={colors.primary}
                />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  No Contract Analyzed Yet
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Take photos or upload images of your contract to get started
                </Text>
              </LinearGradient>
            </View>
          )}

          {!analysisResult && !loading && capturedImages.length > 0 && (
            <View style={styles.captureSection}>
              <View style={styles.captureHeader}>
                <Text style={[styles.captureTitle, { color: colors.text }]}>
                  Captured Pages
                </Text>
                <Text style={[styles.captureCount, { color: colors.primary }]}>
                  {capturedImages.length}
                </Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.imagesScroll}
                contentContainerStyle={styles.imagesScrollContent}
              >
                {capturedImages.map((imageUri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <IconSymbol
                        ios_icon_name="xmark.circle.fill"
                        android_material_icon_name="cancel"
                        size={28}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                    <Text style={[styles.imageLabel, { color: colors.textSecondary }]}>
                      Page {index + 1}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: colors.primary }]}
                onPress={scanAllImages}
              >
                <IconSymbol
                  ios_icon_name="doc.text.magnifyingglass"
                  android_material_icon_name="search"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.scanButtonText}>Scan All Pages</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Analyzing your contract...
              </Text>
              <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
                This may take a few moments
              </Text>
            </View>
          )}

          {analysisResult && !loading && (
            <View style={styles.resultsContainer}>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  style={[styles.backButton, { borderColor: colors.border }]}
                  onPress={resetToHome}
                >
                  <IconSymbol
                    ios_icon_name="arrow.left"
                    android_material_icon_name="arrow-back"
                    size={20}
                    color={colors.text}
                  />
                  <Text style={[styles.backButtonText, { color: colors.text }]}>
                    Back to Home
                  </Text>
                </TouchableOpacity>
              </View>

              {capturedImages.length > 0 && (
                <View style={styles.imagesSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Scanned Pages ({capturedImages.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                    {capturedImages.map((imageUri, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: imageUri }} style={styles.previewImageSmall} />
                        <Text style={[styles.imageLabel, { color: colors.textSecondary }]}>
                          Page {index + 1}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <GradientCard style={styles.scoreCard}>
                <View style={styles.scoreContent}>
                  <ProgressRing
                    progress={riskScore}
                    size={140}
                    strokeWidth={12}
                    color="#FFFFFF"
                  />
                  <View style={styles.scoreDetails}>
                    <Text style={styles.scoreTitle}>Safety Score</Text>
                    <Text style={styles.scoreValue}>{riskScore}</Text>
                    <Text style={styles.scoreLabel}>out of 100</Text>
                  </View>
                </View>
              </GradientCard>

              <View style={styles.chartSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Issue Breakdown</Text>
                <BarChart data={getChartData()} height={200} showValues={true} />
              </View>

              {analysisResult.hiddenRisks.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="warning"
                      size={24}
                      color="#EF4444"
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Hidden Risks
                    </Text>
                  </View>
                  {analysisResult.hiddenRisks.map((risk, index) => {
                    const severityColor = getSeverityColor(risk.severity);
                    const severityLabel = getSeverityLabel(risk.severity);
                    return (
                      <GradientCard key={index} style={styles.issueCard}>
                        <View style={styles.issueHeader}>
                          <Text style={styles.issueTitle}>{risk.title}</Text>
                          <View
                            style={[
                              styles.severityBadge,
                              { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
                            ]}
                          >
                            <Text style={[styles.severityText, { color: '#FFFFFF' }]}>
                              {severityLabel}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.issueDescription}>{risk.description}</Text>
                      </GradientCard>
                    );
                  })}
                </View>
              )}

              {analysisResult.moneyTraps.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      ios_icon_name="dollarsign.circle.fill"
                      android_material_icon_name="attach-money"
                      size={24}
                      color="#FFB800"
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Money Traps</Text>
                  </View>
                  {analysisResult.moneyTraps.map((trap, index) => {
                    const amountText = trap.amount || '';
                    return (
                      <GradientCard key={index} style={styles.issueCard}>
                        <View style={styles.issueHeader}>
                          <Text style={styles.issueTitle}>{trap.title}</Text>
                          {trap.amount && (
                            <View style={[styles.amountBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                              <Text style={[styles.amountText, { color: '#FFFFFF' }]}>
                                {amountText}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.issueDescription}>{trap.description}</Text>
                      </GradientCard>
                    );
                  })}
                </View>
              )}

              {analysisResult.autoRenewTraps.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      ios_icon_name="arrow.clockwise.circle.fill"
                      android_material_icon_name="refresh"
                      size={24}
                      color="#8B5CF6"
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Auto-Renew Traps
                    </Text>
                  </View>
                  {analysisResult.autoRenewTraps.map((trap, index) => {
                    const difficultyText = trap.cancellationDifficulty;
                    return (
                      <GradientCard key={index} style={styles.issueCard}>
                        <View style={styles.issueHeader}>
                          <Text style={styles.issueTitle}>{trap.title}</Text>
                          <View style={[styles.difficultyBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                            <Text style={[styles.difficultyText, { color: '#FFFFFF' }]}>
                              {difficultyText}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.issueDescription}>{trap.description}</Text>
                      </GradientCard>
                    );
                  })}
                </View>
              )}

              {analysisResult.dangerousClauses.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      ios_icon_name="flame.fill"
                      android_material_icon_name="local-fire-department"
                      size={24}
                      color="#3B82F6"
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Dangerous Clauses
                    </Text>
                  </View>
                  {analysisResult.dangerousClauses.map((clause, index) => {
                    const legalImpactText = clause.legalImpact;
                    return (
                      <GradientCard key={index} style={styles.issueCard}>
                        <View style={styles.issueHeader}>
                          <Text style={styles.issueTitle}>{clause.title}</Text>
                          <View style={[styles.legalImpactBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                            <Text style={[styles.legalImpactText, { color: '#FFFFFF' }]}>
                              {legalImpactText}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.issueDescription}>{clause.description}</Text>
                      </GradientCard>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {!analysisResult && !loading && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={takePhoto}
            >
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="camera"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={pickImage}
            >
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="image"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Upload Images
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          onClose={hideModal}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    marginTop: 40,
  },
  emptyStateGradient: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  captureSection: {
    marginTop: 20,
    gap: 16,
  },
  captureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  captureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imagesScrollContent: {
    paddingRight: 20,
  },
  imagePreviewContainer: {
    marginRight: 16,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: 140,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1F2937',
  },
  previewImageSmall: {
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#1F2937',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  imageLabel: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  resultsContainer: {
    gap: 24,
    paddingBottom: 40,
  },
  backButtonContainer: {
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imagesSection: {
    gap: 12,
  },
  imagePreview: {
    marginRight: 12,
    alignItems: 'center',
  },
  scoreCard: {
    padding: 24,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  chartSection: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  issueCard: {
    padding: 16,
    gap: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#FFFFFF',
  },
  issueDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legalImpactBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  legalImpactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
    backgroundColor: colors.background,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
