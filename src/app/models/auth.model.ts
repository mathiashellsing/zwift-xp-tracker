export interface AuthState {
  isAuthenticated: boolean;
  email: string;
  password: string;
  athleteId: string;
  profile: {
    firstName: string;
    lastName: string;
  } | null;
  currentXP: number;
  level: number;
  lastSynced: string;
  isLoading: boolean;
  error: string | null;
}
