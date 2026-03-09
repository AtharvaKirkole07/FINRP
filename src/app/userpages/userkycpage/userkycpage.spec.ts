import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userkycpage } from './userkycpage';

describe('Userkycpage', () => {
  let component: Userkycpage;
  let fixture: ComponentFixture<Userkycpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userkycpage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userkycpage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
