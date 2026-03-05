import { TestBed } from '@angular/core/testing';

import { SelectMuseos } from './select-museos.service';

describe('SelectMuseosService', () => {
  let service: SelectMuseos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectMuseos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
