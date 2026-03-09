import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycUserProcesspage } from './kyc-user-processpage';

describe('KycUserProcesspage', () => {
  let component: KycUserProcesspage;
  let fixture: ComponentFixture<KycUserProcesspage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycUserProcesspage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycUserProcesspage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
