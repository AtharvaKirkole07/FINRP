import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionReports } from './transaction-reports';

describe('TransactionReports', () => {
  let component: TransactionReports;
  let fixture: ComponentFixture<TransactionReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
