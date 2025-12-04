import { TestBed } from '@angular/core/testing';

import { Printing } from './printing';

describe('Printing', () => {
  let service: Printing;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Printing);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
