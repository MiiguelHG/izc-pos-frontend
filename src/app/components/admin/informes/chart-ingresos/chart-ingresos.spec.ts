import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartIngresos } from './chart-ingresos';

describe('ChartIngresos', () => {
  let component: ChartIngresos;
  let fixture: ComponentFixture<ChartIngresos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartIngresos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartIngresos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
