import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosVendidos } from './boletos-vendidos';

describe('BoletosVendidos', () => {
  let component: BoletosVendidos;
  let fixture: ComponentFixture<BoletosVendidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosVendidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosVendidos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
