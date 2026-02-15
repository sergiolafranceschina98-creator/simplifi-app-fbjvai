
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { analyzeContract as analyzeContractAPI } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';
import ProgressRing from '@/components/ProgressRing';
import BarChart from '@/components/BarChart';
import GradientCard from '@/components/GradientCard';

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
  const theme = useTheme();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const pickImage = async () => {
    console.log('User tapped camera button to pick image');
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setModalConfig({
        visible: true,
        title: 'Permission Required',
        message: 'Please allow access to your photo library to scan contracts.',
        type: 'info',
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      console.log('Image selected:', pickerResult.assets[0].uri);
      await analyzeContract(pickerResult.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    console.log('User tapped camera button to take photo');
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setModalConfig({
        visible: true,
        title: 'Permission Required',
        message: 'Please allow camera access to scan contracts.',
        type: 'info',
      });
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!cameraResult.canceled && cameraResult.assets[0]) {
      console.log('Photo taken:', cameraResult.assets[0].uri);
      await analyzeContract(cameraResult.assets[0].uri);
    }
  };

  const analyzeContract = async (imageUri: string) => {
    setAnalyzing(true);
    setResult(null);
    console.log('Starting contract analysis for image:', imageUri);

    try {
      const analysisResult = await analyzeContractAPI(imageUri);
      setResult(analysisResult);
      console.log('Analysis complete:', analysisResult);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      setModalConfig({
        visible: true,
        title: 'Analysis Failed',
        message: 'Unable to analyze the contract. Please try again.',
        type: 'error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return colors.severityHigh;
      case 'medium':
        return colors.severityMedium;
      case 'low':
        return colors.severityLow;
      default:
        return colors.textSecondary;
    }
  };

  const getSeverityLabel = (severity?: string) => {
    return severity ? severity.toUpperCase() : '';
  };

  const calculateRiskScore = () => {
    if (!result) return 0;
    const highRisks = result.hiddenRisks.filter(r => r.severity === 'high').length;
    const mediumRisks = result.hiddenRisks.filter(r => r.severity === 'medium').length;
    const lowRisks = result.hiddenRisks.filter(r => r.severity === 'low').length;
    
    const totalIssues = result.hiddenRisks.length + result.moneyTraps.length + 
                        result.autoRenewTraps.length + result.dangerousClauses.length;
    
    if (totalIssues === 0) return 100;
    
    const riskScore = 100 - ((highRisks * 30) + (mediumRisks * 15) + (lowRisks * 5));
    return Math.max(0, Math.min(100, riskScore));
  };

  const getChartData = () => {
    if (!result) return [];
    
    return [
      {
        label: 'Risks',
        value: result.hiddenRisks.length,
        color: colors.danger,
      },
      {
        label: 'Money',
        value: result.moneyTraps.length,
        color: colors.warning,
      },
      {
        label: 'Auto-Renew',
        value: result.autoRenewTraps.length,
        color: colors.accentPurple,
      },
      {
        label: 'Clauses',
        value: result.dangerousClauses.length,
        color: colors.primary,
      },
    ];
  };

  const riskScore = calculateRiskScore();
  const chartData = getChartData();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Terms Simplifier',
          headerShown: true,
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!result && !analyzing && (
          <View style={styles.emptyState}>
            <View style={styles.heroSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <IconSymbol
                    ios_icon_name="doc.text.magnifyingglass"
                    android_material_icon_name="description"
                    size={64}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </View>
              
              <Text style={styles.heroTitle}>Understand Any Contract</Text>
              <Text style={styles.heroSubtitle}>in 10 Seconds</Text>
              
              <Text style={styles.heroDescription}>
                Scan subscriptions, privacy policies, rental contracts, or freelance agreements to uncover hidden risks and money traps.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButtonWrapper}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <IconSymbol
                    ios_icon_name="camera.fill"
                    android_material_icon_name="camera"
                    size={24}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.primaryButtonText}>Take Photo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <IconSymbol
                  ios_icon_name="photo.fill"
                  android_material_icon_name="image"
                  size={24}
                  color={colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={styles.secondaryButtonText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="bolt.fill"
                    android_material_icon_name="flash-on"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>Instant Analysis</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="shield.fill"
                    android_material_icon_name="security"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>Risk Detection</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <IconSymbol
                    ios_icon_name="chart.bar.fill"
                    android_material_icon_name="bar-chart"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.featureText}>Visual Reports</Text>
              </View>
            </View>
          </View>
        )}

        {analyzing && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingRing}>
              <ProgressRing size={140} strokeWidth={14} progress={75} />
              <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            </View>
            <Text style={styles.loadingText}>Analyzing Contract</Text>
            <Text style={styles.loadingSubtext}>Extracting text and identifying risks</Text>
          </View>
        )}

        {result && !analyzing && (
          <View style={styles.resultsContainer}>
            <GradientCard>
              <View style={styles.scoreCard}>
                <View style={styles.scoreLeft}>
                  <Text style={styles.scoreLabel}>Safety Score</Text>
                  <Text style={styles.scoreValue}>{riskScore.toFixed(0)}</Text>
                  <Text style={styles.scoreSubtext}>out of 100</Text>
                </View>
                <View style={styles.scoreRight}>
                  <ProgressRing size={100} strokeWidth={10} progress={riskScore} />
                </View>
              </View>
            </GradientCard>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Issues Found</Text>
              <BarChart data={chartData} height={180} />
            </View>

            {result.hiddenRisks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="warning"
                      size={24}
                      color={colors.danger}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Hidden Risks</Text>
                </View>
                {result.hiddenRisks.map((risk, index) => {
                  const severityColor = getSeverityColor(risk.severity);
                  const severityLabel = getSeverityLabel(risk.severity);
                  
                  return (
                    <View key={index} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{risk.title}</Text>
                        {risk.severity && (
                          <View style={[styles.badge, { backgroundColor: severityColor }]}>
                            <Text style={styles.badgeText}>{severityLabel}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardDescription}>{risk.description}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {result.moneyTraps.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol
                      ios_icon_name="dollarsign.circle.fill"
                      android_material_icon_name="payment"
                      size={24}
                      color={colors.warning}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Money Traps</Text>
                </View>
                {result.moneyTraps.map((trap, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardTitle}>{trap.title}</Text>
                    <Text style={styles.cardDescription}>{trap.description}</Text>
                    {trap.amount && (
                      <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Amount:</Text>
                        <Text style={styles.amountValue}>{trap.amount}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {result.autoRenewTraps.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol
                      ios_icon_name="arrow.clockwise.circle.fill"
                      android_material_icon_name="sync"
                      size={24}
                      color={colors.accentPurple}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Auto-Renew Traps</Text>
                </View>
                {result.autoRenewTraps.map((trap, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardTitle}>{trap.title}</Text>
                    <Text style={styles.cardDescription}>{trap.description}</Text>
                    <View style={styles.difficultyContainer}>
                      <Text style={styles.difficultyLabel}>Cancellation:</Text>
                      <Text style={styles.difficultyValue}>{trap.cancellationDifficulty}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {result.dangerousClauses.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <IconSymbol
                      ios_icon_name="flame.fill"
                      android_material_icon_name="error"
                      size={24}
                      color={colors.danger}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Dangerous Clauses</Text>
                </View>
                {result.dangerousClauses.map((clause, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardTitle}>{clause.title}</Text>
                    <Text style={styles.cardDescription}>{clause.description}</Text>
                    <View style={styles.impactContainer}>
                      <Text style={styles.impactLabel}>Legal Impact:</Text>
                      <Text style={styles.impactValue}>{clause.legalImpact}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.scanAgainButtonWrapper}
              onPress={() => {
                console.log('User tapped Scan Another Contract');
                setResult(null);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanAgainButton}
              >
                <IconSymbol
                  ios_icon_name="arrow.clockwise"
                  android_material_icon_name="refresh"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.scanAgainButtonText}>Scan Another Contract</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    letterSpacing: 0.1,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButtonWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingRing: {
    position: 'relative',
    marginBottom: 32,
  },
  loadingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  loadingSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  scoreSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 0.1,
  },
  scoreRight: {
    marginLeft: 20,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  amountContainer: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  amountValue: {
    fontSize: 15,
    color: colors.warning,
    fontWeight: '700',
  },
  difficultyContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  difficultyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  difficultyValue: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  impactContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  impactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  impactValue: {
    fontSize: 15,
    color: colors.danger,
    fontWeight: '600',
    lineHeight: 22,
  },
  scanAgainButtonWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scanAgainButton: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
