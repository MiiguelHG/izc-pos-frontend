import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosListOp } from './productos-list-op';

describe('ProductosListOp', () => {
  let component: ProductosListOp;
  let fixture: ComponentFixture<ProductosListOp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosListOp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosListOp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
