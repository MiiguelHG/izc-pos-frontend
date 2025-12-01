import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioBase } from './formulario-base';

describe('FormularioBase', () => {
  let component: FormularioBase;
  let fixture: ComponentFixture<FormularioBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
