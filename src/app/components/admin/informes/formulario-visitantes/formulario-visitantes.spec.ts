import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioVisitantes } from './formulario-visitantes';

describe('FormularioVisitantes', () => {
  let component: FormularioVisitantes;
  let fixture: ComponentFixture<FormularioVisitantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioVisitantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioVisitantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
