import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KycApplication } from '../kycapplications/kycapplications';

@Injectable({
  providedIn: 'root'
})
export class KycStateService {

  private selectedApplication = new BehaviorSubject<KycApplication | null>(null);

  selectedApplication$ = this.selectedApplication.asObservable();

  setSelectedApplication(app: KycApplication) {
    this.selectedApplication.next(app);
  }

  getSelectedApplication() {
    return this.selectedApplication.value;
  }


}