export type UserRole = 'asha' | 'doctor' | 'pharmacy' | 'patient';

export type Language = 'en' | 'hi';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  village: string;
  symptoms: string[];
  urgency_score: 1 | 2 | 3;
  created_at: string;
  synced: boolean;
  asha_worker_id: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  name_hi: string;
  stock: number;
  critical: boolean;
  last_updated: string;
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