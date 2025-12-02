import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosVenta } from './productos-venta';

describe('ProductosVenta', () => {
  let component: ProductosVenta;
  let fixture: ComponentFixture<ProductosVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosVenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
