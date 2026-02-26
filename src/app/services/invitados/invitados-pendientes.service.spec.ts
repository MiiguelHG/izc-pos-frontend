import { TestBed } from '@angular/core/testing';

import { InvitadosPendientesService } from './invitados-pendientes.service';

describe('InvitadosPendientesService', () => {
  let service: InvitadosPendientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitadosPendientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
