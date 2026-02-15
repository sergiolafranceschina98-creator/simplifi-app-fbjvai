
import Constants from 'expo-constants';

/**
 * Get the backend URL from app.json configuration
 */
export const getBackendUrl = (): string => {
  const backendUrl = Constants.expoConfig?.extra?.backendUrl;
  
  if (!backendUrl) {
    throw new Error('Backend URL not configured in app.json');
  }
  
  return backendUrl;
};

/**
 * API Response types
 */
export interface RiskItem {
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface MoneyTrap {
  title: string;
  description: string;
  amount?: string;
}

export interface AutoRenewTrap {
  title: string;
  description: string;
  cancellationDifficulty: string;
}

export interface DangerousClause {
  title: string;
  description: string;
  legalImpact: string;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  extractedText: string;
  hiddenRisks: RiskItem[];
  moneyTraps: MoneyTrap[];
  autoRenewTraps: AutoRenewTrap[];
  dangerousClauses: DangerousClause[];
  createdAt: string;
}

/**
 * Analyze a contract image
 * @param imageUri - Local URI of the image to analyze
 * @returns Analysis result with risks, traps, and dangerous clauses
 */
export const analyzeContract = async (imageUri: string): Promise<AnalysisResult> => {
  const backendUrl = getBackendUrl();
  const endpoint = `${backendUrl}/api/analyze-contract`;
  
  console.log('[API] Analyzing contract:', imageUri);
  console.log('[API] Endpoint:', endpoint);
  
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'contract.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append the image file
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);
    
    console.log('[API] Uploading image:', filename, type);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`Failed to analyze contract: ${response.status} ${response.statusText}`);
    }
    
    const result: AnalysisResult = await response.json();
    console.log('[API] Analysis complete:', result.id);
    
    return result;
  } catch (error) {
    console.error('[API] Error analyzing contract:', error);
    throw error;
  }
};

/**
 * Get a specific analysis by ID
 * @param id - Analysis ID
 * @returns Analysis result
 */
export const getAnalysis = async (id: string): Promise<AnalysisResult> => {
  const backendUrl = getBackendUrl();
  const endpoint = `${backendUrl}/api/analyses/${id}`;
  
  console.log('[API] Fetching analysis:', id);
  console.log('[API] Endpoint:', endpoint);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response:', errorText);
      throw new Error(`Failed to fetch analysis: ${response.status} ${response.statusText}`);
    }
    
    const result: AnalysisResult = await response.json();
    console.log('[API] Analysis fetched:', result.id);
    
    return result;
  } catch (error) {
    console.error('[API] Error fetching analysis:', error);
    throw error;
  }
};
