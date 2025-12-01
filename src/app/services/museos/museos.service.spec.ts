import { TestBed } from '@angular/core/testing';

import { MuseosService } from './museos.service';

describe('MuseosService', () => {
  let service: MuseosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MuseosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
