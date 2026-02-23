import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortesiaCancelar } from './cortesia-cancelar';

describe('CortesiaCancelar', () => {
  let component: CortesiaCancelar;
  let fixture: ComponentFixture<CortesiaCancelar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortesiaCancelar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortesiaCancelar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
