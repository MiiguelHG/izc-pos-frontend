import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosPrecioBase } from './boletos-precio-base';

describe('BoletosPrecioBase', () => {
  let component: BoletosPrecioBase;
  let fixture: ComponentFixture<BoletosPrecioBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosPrecioBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosPrecioBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
