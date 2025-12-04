import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoVerVenta } from './producto-ver-venta';

describe('ProductoVerVenta', () => {
  let component: ProductoVerVenta;
  let fixture: ComponentFixture<ProductoVerVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoVerVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoVerVenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
