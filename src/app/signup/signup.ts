// src/app/signup/signup.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, SignupRequest } from './ServiceInterface/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {

  form: SignupRequest = {
    username: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirm = false;

  constructor(private authService: AuthService, private router: Router) {}

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.form.password !== this.confirmPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.username || !this.form.email || !this.form.password) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (this.form.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isSubmitting = true;

    this.authService.signup(this.form).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error || 'Signup failed. Please try again.';
      }
    });
  }
}