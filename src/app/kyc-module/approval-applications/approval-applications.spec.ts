import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalApplications } from './approval-applications';

describe('ApprovalApplications', () => {
  let component: ApprovalApplications;
  let fixture: ComponentFixture<ApprovalApplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalApplications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalApplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
