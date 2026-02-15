
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { analyzeContract as analyzeContractAPI } from '@/utils/api';
import { Modal } from '@/components/ui/Modal';

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
      // Call the backend API to analyze the contract
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Terms Simplifier',
          headerShown: true,
          headerLargeTitle: true,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!result && !analyzing && (
          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="doc.text.magnifyingglass"
                android_material_icon_name="description"
                size={80}
                color={colors.primary}
              />
            </View>
            
            <Text style={styles.emptyTitle}>Understand Any Contract</Text>
            <Text style={styles.emptySubtitle}>in 10 Seconds</Text>
            
            <Text style={styles.emptyDescription}>
              Scan subscriptions, privacy policies, rental contracts, or freelance agreements to uncover hidden risks and money traps.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={takePhoto}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="camera.fill"
                  android_material_icon_name="camera"
                  size={24}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={pickImage}
                activeOpacity={0.7}
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
          </View>
        )}

        {analyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing contract...</Text>
            <Text style={styles.loadingSubtext}>Extracting text and identifying risks</Text>
          </View>
        )}

        {result && !analyzing && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Complete</Text>

            {result.hiddenRisks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={24}
                    color={colors.danger}
                  />
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
                  <IconSymbol
                    ios_icon_name="dollarsign.circle.fill"
                    android_material_icon_name="payment"
                    size={24}
                    color={colors.highlight}
                  />
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
                  <IconSymbol
                    ios_icon_name="arrow.clockwise.circle.fill"
                    android_material_icon_name="sync"
                    size={24}
                    color={colors.secondary}
                  />
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
                  <IconSymbol
                    ios_icon_name="flame.fill"
                    android_material_icon_name="error"
                    size={24}
                    color={colors.danger}
                  />
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
              style={styles.scanAgainButton}
              onPress={() => {
                console.log('User tapped Scan Another Contract');
                setResult(null);
              }}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.scanAgainButtonText}>Scan Another Contract</Text>
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
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  amountValue: {
    fontSize: 14,
    color: colors.highlight,
    fontWeight: '600',
  },
  difficultyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  difficultyValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  impactContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
  },
  scanAgainButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
