import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './utilities/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(                      // ← fixes SSR fetch warning
      withInterceptors([AuthInterceptor]) // ← keeps auth working
    )
  ]
};