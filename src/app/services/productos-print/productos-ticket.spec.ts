import { TestBed } from '@angular/core/testing';

import { ProductosTicket } from './productos-ticket';

describe('ProductosTicket', () => {
  let service: ProductosTicket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosTicket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
