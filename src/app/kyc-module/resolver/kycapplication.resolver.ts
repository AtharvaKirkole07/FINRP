import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { KycOfficerService, KycApplicationSummary } from '../service/KycService';

@Injectable({
  providedIn: 'root'
})
export class KycApplicationResolver implements Resolve<KycApplicationSummary[]> {

  constructor(private kycOfficerService: KycOfficerService) {}

  resolve(): Observable<KycApplicationSummary[]> {
    return this.kycOfficerService.getAllApplications();
  }
}