export const translations = {
  en: {
    // App Navigation
    appName: 'Sehat-Gram',
    dashboard: 'Dashboard',
    patients: 'Patients',
    medicines: 'Medicines',
    consultation: 'Consultation',
    
    // User Roles
    ashaWorker: 'ASHA Worker',
    doctor: 'Doctor',
    pharmacy: 'Pharmacy',
    patient: 'Patient',
    
    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    sync: 'Sync',
    add: 'Add',
    update: 'Update',
    
    // Network Status
    online: 'Online',
    offline: 'Offline',
    syncing: 'Syncing...',
    lastSync: 'Last Sync',
    
    // Patient Form
    patientName: 'Patient Name',
    age: 'Age',
    gender: 'Gender',
    village: 'Village',
    symptoms: 'Symptoms',
    urgencyScore: 'Urgency Score',
    
    // Urgency Levels
    lowUrgency: 'Low Priority',
    mediumUrgency: 'Medium Priority',
    highUrgency: 'High Priority',
    
    // Medicine Inventory
    medicineName: 'Medicine Name',
    stockCount: 'Stock Count',
    updateStock: 'Update Stock',
    criticalLow: 'Critical Low',
    inStock: 'In Stock',
    
    // Consultation
    startConsultation: 'Start Video Consultation',
    viewPatient: 'View Patient Details',
    
    // Symptoms
    symptoms_list: {
      chest_pain: 'Chest Pain',
      difficulty_breathing: 'Difficulty Breathing',
      severe_bleeding: 'Severe Bleeding',
      unconscious: 'Unconscious',
      severe_headache: 'Severe Headache',
      high_fever: 'High Fever',
      moderate_pain: 'Moderate Pain',
      persistent_cough: 'Persistent Cough',
      nausea: 'Nausea',
      dizziness: 'Dizziness',
      rash: 'Skin Rash',
      fatigue: 'Fatigue',
      mild_pain: 'Mild Pain',
      cold_symptoms: 'Cold Symptoms',
      minor_cut: 'Minor Cut',
      mild_headache: 'Mild Headache',
      stomach_ache: 'Stomach Ache',
    }
  },
  hi: {
    // App Navigation
    appName: 'सेहत-ग्राम',
    dashboard: 'डैशबोर्ड',
    patients: 'मरीज़',
    medicines: 'दवाइयां',
    consultation: 'परामर्श',
    
    // User Roles
    ashaWorker: 'आशा कार्यकर्ता',
    doctor: 'डॉक्टर',
    pharmacy: 'फार्मेसी',
    patient: 'मरीज़',
    
    // Common Actions
    save: 'सेव करें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    sync: 'सिंक करें',
    add: 'जोड़ें',
    update: 'अपडेट करें',
    
    // Network Status
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    syncing: 'सिंक हो रहा है...',
    lastSync: 'अंतिम सिंक',
    
    // Patient Form
    patientName: 'मरीज़ का नाम',
    age: 'उम्र',
    gender: 'लिंग',
    village: 'गांव',
    symptoms: 'लक्षण',
    urgencyScore: 'प्राथमिकता स्कोर',
    
    // Urgency Levels
    lowUrgency: 'कम प्राथमिकता',
    mediumUrgency: 'मध्यम प्राथमिकता',
    highUrgency: 'उच्च प्राथमिकता',
    
    // Medicine Inventory
    medicineName: 'दवा का नाम',
    stockCount: 'स्टॉक गिनती',
    updateStock: 'स्टॉक अपडेट करें',
    criticalLow: 'अत्यंत कम',
    inStock: 'स्टॉक में',
    
    // Consultation
    startConsultation: 'वीडियो परामर्श शुरू करें',
    viewPatient: 'मरीज़ विवरण देखें',
    
    // Symptoms
    symptoms_list: {
      chest_pain: 'सीने में दर्द',
      difficulty_breathing: 'सांस लेने में कठिनाई',
      severe_bleeding: 'गंभीर रक्तस्राव',
      unconscious: 'बेहोशी',
      severe_headache: 'गंभीर सिरदर्द',
      high_fever: 'तेज़ बुखार',
      moderate_pain: 'मध्यम दर्द',
      persistent_cough: 'लगातार खांसी',
      nausea: 'मतली',
      dizziness: 'चक्कर आना',
      rash: 'त्वचा पर चकत्ते',
      fatigue: 'थकान',
      mild_pain: 'हल्का दर्द',
      cold_symptoms: 'ज़ुकाम के लक्षण',
      minor_cut: 'छोटी चोट',
      mild_headache: 'हल्का सिरदर्द',
      stomach_ache: 'पेट दर्द',
    }
  }
};

export function t(key: string, language: 'en' | 'hi'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}