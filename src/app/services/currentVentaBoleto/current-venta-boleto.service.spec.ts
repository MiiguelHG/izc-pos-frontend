import { TestBed } from '@angular/core/testing';

import { CurrentVentaBoletoService } from './current-venta-boleto.service';

describe('CurrentVentaBoletoService', () => {
  let service: CurrentVentaBoletoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentVentaBoletoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
