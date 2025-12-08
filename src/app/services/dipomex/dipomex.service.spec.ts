import { TestBed } from '@angular/core/testing';

import { DipomexService } from './dipomex.service';

describe('DipomexService', () => {
  let service: DipomexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DipomexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
