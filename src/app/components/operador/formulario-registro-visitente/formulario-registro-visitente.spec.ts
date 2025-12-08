import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRegistroVisitente } from './formulario-registro-visitente';

describe('FormVisit', () => {
  let component: FormularioRegistroVisitente;
  let fixture: ComponentFixture<FormularioRegistroVisitente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRegistroVisitente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRegistroVisitente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
