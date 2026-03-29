import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionUser } from './transaction-user';

describe('TransactionUser', () => {
  let component: TransactionUser;
  let fixture: ComponentFixture<TransactionUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
