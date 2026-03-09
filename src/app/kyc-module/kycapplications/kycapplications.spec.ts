import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kycapplications } from './kycapplications';

describe('Kycapplications', () => {
  let component: Kycapplications;
  let fixture: ComponentFixture<Kycapplications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kycapplications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kycapplications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
