// src/app/serviceInterface/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8089/api/auth';

  constructor(private http: HttpClient) {}

  signup(request: SignupRequest): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/signup`,
      request,
      { responseType: 'text' }   // backend returns plain string "User registered successfully"
    );
  }
}