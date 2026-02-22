import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosHabilitarDeshabilitar } from './boletos-habilitar-deshabilitar';

describe('BoletosHabilitarDeshabilitar', () => {
  let component: BoletosHabilitarDeshabilitar;
  let fixture: ComponentFixture<BoletosHabilitarDeshabilitar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosHabilitarDeshabilitar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosHabilitarDeshabilitar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
