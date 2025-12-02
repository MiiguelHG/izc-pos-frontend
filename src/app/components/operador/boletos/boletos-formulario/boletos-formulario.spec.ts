import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosFormulario } from './boletos-formulario';

describe('BoletosFormulario', () => {
  let component: BoletosFormulario;
  let fixture: ComponentFixture<BoletosFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
