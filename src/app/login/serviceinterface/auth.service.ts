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

  private readonly API = 'http://localhost:8089/api/auth';

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, data).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
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
    localStorage.removeItem('token');
  }

  // 🔑 TOKEN ACCESS
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ AUTH CHECK
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
