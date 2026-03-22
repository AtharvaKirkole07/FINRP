import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { KycOfficerService, KycL2QueueItem } from '../service/KycService';

@Injectable({ providedIn: 'root' })
export class KycLevel2ApplicationResolver implements Resolve<KycL2QueueItem[]> {

  constructor(
    private kycService: KycOfficerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  resolve(): Observable<KycL2QueueItem[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return this.kycService.getL2Queue();
  }
}