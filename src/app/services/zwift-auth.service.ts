import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthState } from '../models/auth.model';
import { ZwiftBackendService } from './zwift-backend.service';

const STORAGE_KEYS = {
  EMAIL: 'zwift-session.email',
  PASSWORD: 'zwift-session.password',
  ATHLETE_ID: 'zwift-session.athleteId',
  FIRST_NAME: 'zwift-session.firstName',
  LAST_NAME: 'zwift-session.lastName',
  XP: 'zwift-session.xp',
  LEVEL: 'zwift-session.level',
  LAST_SYNCED: 'zwift-session.lastSynced',
};

const DEFAULT_STATE: AuthState = {
  isAuthenticated: false,
  email: '',
  password: '',
  athleteId: '',
  profile: null,
  currentXP: 0,
  level: 0,
  lastSynced: '',
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ZwiftAuthService {
  private stateSubject = new BehaviorSubject<AuthState>(this.loadFromStorage());
  state$: Observable<AuthState> = this.stateSubject.asObservable();

  constructor(private backend: ZwiftBackendService) {}

  get state(): AuthState {
    return this.stateSubject.value;
  }

  private loadFromStorage(): AuthState {
    try {
      const email = localStorage.getItem(STORAGE_KEYS.EMAIL) ?? '';
      const password = localStorage.getItem(STORAGE_KEYS.PASSWORD) ?? '';
      const athleteId = localStorage.getItem(STORAGE_KEYS.ATHLETE_ID) ?? '';
      const firstName = localStorage.getItem(STORAGE_KEYS.FIRST_NAME) ?? '';
      const lastName = localStorage.getItem(STORAGE_KEYS.LAST_NAME) ?? '';
      const xp = parseInt(localStorage.getItem(STORAGE_KEYS.XP) ?? '0', 10);
      const level = parseInt(localStorage.getItem(STORAGE_KEYS.LEVEL) ?? '0', 10);
      const lastSynced = localStorage.getItem(STORAGE_KEYS.LAST_SYNCED) ?? '';

      if (email && password && athleteId) {
        return {
          isAuthenticated: true,
          email,
          password,
          athleteId,
          profile: firstName ? { firstName, lastName } : null,
          currentXP: xp,
          level,
          lastSynced,
          isLoading: false,
          error: null,
        };
      }
    } catch {
      // localStorage not available
    }
    return { ...DEFAULT_STATE };
  }

  private saveToStorage(state: AuthState): void {
    try {
      if (state.isAuthenticated) {
        localStorage.setItem(STORAGE_KEYS.EMAIL, state.email);
        localStorage.setItem(STORAGE_KEYS.PASSWORD, state.password);
        localStorage.setItem(STORAGE_KEYS.ATHLETE_ID, state.athleteId);
        localStorage.setItem(STORAGE_KEYS.FIRST_NAME, state.profile?.firstName ?? '');
        localStorage.setItem(STORAGE_KEYS.LAST_NAME, state.profile?.lastName ?? '');
        localStorage.setItem(STORAGE_KEYS.XP, String(state.currentXP));
        localStorage.setItem(STORAGE_KEYS.LEVEL, String(state.level));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, state.lastSynced);
      } else {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      }
    } catch {
      // ignore storage errors
    }
  }

  private patch(partial: Partial<AuthState>): void {
    const next = { ...this.stateSubject.value, ...partial };
    this.stateSubject.next(next);
    this.saveToStorage(next);
  }

  login(email: string, password: string): void {
    this.patch({ isLoading: true, error: null });

    this.backend.login(email, password).subscribe({
      next: (res) => {
        if (res.success) {
          const newState: AuthState = {
            isAuthenticated: true,
            email,
            password,
            athleteId: res.athleteId ?? '',
            profile: res.profile
              ? { firstName: res.profile.firstName, lastName: res.profile.lastName }
              : null,
            currentXP: res.xp ?? res.profile?.totalExperiencePoints ?? 0,
            level: res.level ?? res.profile?.achievementLevel ?? 0,
            lastSynced: new Date().toISOString(),
            isLoading: false,
            error: null,
          };
          this.stateSubject.next(newState);
          this.saveToStorage(newState);
        } else {
          this.patch({ isLoading: false, error: res.error ?? 'Login failed' });
        }
      },
      error: (err) => {
        const msg =
          err?.error?.error ?? err?.message ?? 'Login failed. Check credentials.';
        this.patch({ isLoading: false, error: msg });
      },
    });
  }

  sync(): void {
    const { email, password } = this.state;
    if (!email || !password) return;

    this.patch({ isLoading: true, error: null });

    this.backend.syncXP(email, password).subscribe({
      next: (res) => {
        if (res.success) {
          this.patch({
            currentXP: res.xp ?? this.state.currentXP,
            level: res.level ?? this.state.level,
            lastSynced: new Date().toISOString(),
            isLoading: false,
            error: null,
          });
        } else {
          this.patch({ isLoading: false, error: res.error ?? 'Sync failed' });
        }
      },
      error: (err) => {
        const msg = err?.error?.error ?? err?.message ?? 'Sync failed';
        this.patch({ isLoading: false, error: msg });
      },
    });
  }

  logout(): void {
    this.backend.logout().subscribe({ error: () => {} });
    const cleared = { ...DEFAULT_STATE };
    this.stateSubject.next(cleared);
    this.saveToStorage(cleared);
  }

  clearError(): void {
    this.patch({ error: null });
  }
}
