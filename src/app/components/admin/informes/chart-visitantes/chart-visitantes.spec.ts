import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartVisitantes } from './chart-visitantes';

describe('ChartVisitantes', () => {
  let component: ChartVisitantes;
  let fixture: ComponentFixture<ChartVisitantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartVisitantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartVisitantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
