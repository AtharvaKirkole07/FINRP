import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycApprover } from './kyc-approver';

describe('KycApprover', () => {
  let component: KycApprover;
  let fixture: ComponentFixture<KycApprover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycApprover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycApprover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
