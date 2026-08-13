import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accountpage } from './accountpage';

describe('Accountpage', () => {
  let component: Accountpage;
  let fixture: ComponentFixture<Accountpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accountpage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accountpage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
