import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycReports } from './kyc-reports';

describe('KycReports', () => {
  let component: KycReports;
  let fixture: ComponentFixture<KycReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
