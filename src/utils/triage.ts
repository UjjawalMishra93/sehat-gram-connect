// AI-Powered Symptom Checker - Local Triage Logic
export interface SymptomScore {
  symptom: string;
  weight: number;
}

// Symptom scoring weights for triage calculation
const SYMPTOM_WEIGHTS: Record<string, number> = {
  // High urgency symptoms (3 points)
  'chest_pain': 3,
  'difficulty_breathing': 3,
  'severe_bleeding': 3,
  'unconscious': 3,
  'severe_headache': 3,
  'high_fever': 3,
  
  // Medium urgency symptoms (2 points)
  'moderate_pain': 2,
  'persistent_cough': 2,
  'nausea': 2,
  'dizziness': 2,
  'rash': 2,
  'fatigue': 2,
  
  // Low urgency symptoms (1 point)
  'mild_pain': 1,
  'cold_symptoms': 1,
  'minor_cut': 1,
  'mild_headache': 1,
  'stomach_ache': 1,
};

export function calculateTriageScore(symptoms: string[]): 1 | 2 | 3 {
  if (symptoms.length === 0) return 1;
  
  const totalScore = symptoms.reduce((sum, symptom) => {
    return sum + (SYMPTOM_WEIGHTS[symptom] || 1);
  }, 0);
  
  const averageScore = totalScore / symptoms.length;
  
  // Determine urgency level
  if (averageScore >= 2.5) return 3; // High urgency
  if (averageScore >= 1.5) return 2; // Medium urgency
  return 1; // Low urgency
}

export function getUrgencyLabel(score: 1 | 2 | 3, language: 'en' | 'hi'): string {
  const labels = {
    en: { 1: 'Low', 2: 'Medium', 3: 'High' },
    hi: { 1: 'कम', 2: 'मध्यम', 3: 'उच्च' }
  };
  return labels[language][score];
}

export function getUrgencyColor(score: 1 | 2 | 3): string {
  const colors = {
    1: 'low-urgency',
    2: 'medium-urgency', 
    3: 'high-urgency'
  };
  return colors[score];
}