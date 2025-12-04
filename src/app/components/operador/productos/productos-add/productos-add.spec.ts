import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosAdd } from './productos-add';

describe('ProductosAdd', () => {
  let component: ProductosAdd;
  let fixture: ComponentFixture<ProductosAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
