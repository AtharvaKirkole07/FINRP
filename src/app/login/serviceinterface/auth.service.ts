import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API       = 'http://localhost:8089/api/auth';
  private readonly TOKEN_KEY = 'token';   // keeping your existing key

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, data).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  // 📝 SIGNUP
  signup(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.API}/signup`, data);
  }

  // 🚪 LOGOUT
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // 🔑 TOKEN ACCESS
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ✅ AUTH CHECK — checks presence + expiry
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // ⏰ EXPIRY DECODE — reads exp claim from JWT payload
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();   // exp is in seconds, Date.now() in ms
    } catch {
      return true;   // malformed token → treat as expired → force re-login
    }
  }

  getLoggedInUsername(): string | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;   // Spring Security puts username in 'sub' claim
  } catch {
    return null;
  }
}

}