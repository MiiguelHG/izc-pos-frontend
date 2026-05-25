import { TestBed } from '@angular/core/testing';

import { BoletoBaseService } from './boleto-base.service';

describe('BoletoBaseService', () => {
  let service: BoletoBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletoBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
