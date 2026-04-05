import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ZwiftBackendService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = this.detectBaseUrl();
  }

  private detectBaseUrl(): string {
    const { hostname, port } = window.location;

    if (hostname === 'localhost' && port === '3001') {
      return 'http://localhost:3001/api/zwift';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Try the Express backend first (port 3001), else use Netlify Functions
      if (port === '3001') {
        return 'http://localhost:3001/api/zwift';
      }
      // Development with netlify dev (port 8888)
      return '/.netlify/functions';
    }
    // Production Netlify
    return '/.netlify/functions';
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const url = this.baseUrl.includes('netlify')
      ? `${this.baseUrl}/login`
      : `${this.baseUrl}/login`;
    return this.http.post<LoginResponse>(url, { email, password });
  }

  syncXP(email: string, password: string): Observable<SyncResponse> {
    const url = this.baseUrl.includes('netlify')
      ? `${this.baseUrl}/sync`
      : `${this.baseUrl}/sync`;
    return this.http.post<SyncResponse>(url, { email, password });
  }

  logout(): Observable<unknown> {
    const url = this.baseUrl.includes('netlify')
      ? `${this.baseUrl}/logout`
      : `${this.baseUrl}/logout`;
    return this.http.post(url, {});
  }
}

export interface LoginResponse {
  success: boolean;
  athleteId?: string;
  profile?: {
    firstName: string;
    lastName: string;
    totalExperiencePoints?: number;
    achievementLevel?: number;
  };
  xp?: number;
  level?: number;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  xp?: number;
  level?: number;
  error?: string;
}
