import { TestBed } from '@angular/core/testing';

import { ConfiguracionQRService } from './configuracion-qr.service';

describe('ConfiguracionQRService', () => {
  let service: ConfiguracionQRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionQRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
