import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioIngresos } from './formulario-ingresos';

describe('FormularioIngresos', () => {
  let component: FormularioIngresos;
  let fixture: ComponentFixture<FormularioIngresos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioIngresos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioIngresos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
