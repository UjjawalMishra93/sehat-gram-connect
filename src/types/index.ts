export type UserRole = 'asha' | 'doctor' | 'pharmacy' | 'patient';

export type Language = 'en' | 'hi';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  village: string;
  symptoms: string[];
  urgencyScore: 1 | 2 | 3;
  timestamp: string;
  synced: boolean;
  ashaWorker: string;
}

export interface Medicine {
  id: string;
  name: string;
  nameHi: string;
  stock: number;
  critical: boolean;
  lastUpdated: string;
}

export interface NetworkStatus {
  online: boolean;
  lastSync: string;
}

export interface AppState {
  currentUser: {
    role: UserRole;
    name: string;
    id: string;
  };
  language: Language;
  networkStatus: NetworkStatus;
  patients: Patient[];
  medicines: Medicine[];
  pendingSync: Patient[];
}