import { TestBed } from '@angular/core/testing';

import { InvitadosService } from './invitados.service';

describe('InvitadosService', () => {
  let service: InvitadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
