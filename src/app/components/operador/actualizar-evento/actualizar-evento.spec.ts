import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarEvento } from './actualizar-evento';

describe('ActualizarEvento', () => {
  let component: ActualizarEvento;
  let fixture: ComponentFixture<ActualizarEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarEvento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualizarEvento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
