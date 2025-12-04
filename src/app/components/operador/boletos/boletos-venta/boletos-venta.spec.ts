import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosVenta } from './boletos-venta';

describe('BoletosVenta', () => {
  let component: BoletosVenta;
  let fixture: ComponentFixture<BoletosVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosVenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
