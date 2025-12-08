import { TestBed } from '@angular/core/testing';

import { BoletoEmitidoService } from './boleto-emitido.service';

describe('BoletoEmitidoService', () => {
  let service: BoletoEmitidoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletoEmitidoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
