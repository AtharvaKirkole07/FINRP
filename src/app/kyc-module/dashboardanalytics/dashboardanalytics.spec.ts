import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboardanalytics } from './dashboardanalytics';

describe('Dashboardanalytics', () => {
  let component: Dashboardanalytics;
  let fixture: ComponentFixture<Dashboardanalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboardanalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboardanalytics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
