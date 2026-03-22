import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopbarComponent } from './topbar/topbar'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,TopbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('erpfrontendApp');



  // Pages where topbar should NOT appear
  private readonly hiddenRoutes = ['/login', '/signup'];
 
  currentRoute = '';
 
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects;
      });
  }
 
  showTopbar(): boolean {
    return !this.hiddenRoutes.some(route =>
      this.currentRoute.startsWith(route)
    );
  }


}
