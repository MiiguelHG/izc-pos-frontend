import { TestBed } from '@angular/core/testing';

import { VisitantesService } from './visitantes.service';

describe('VisitantesService', () => {
  let service: VisitantesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitantesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
