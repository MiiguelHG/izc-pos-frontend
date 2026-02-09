import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionCortesia } from './notificacion-cortesia';

describe('NotificacionCortesia', () => {
  let component: NotificacionCortesia;
  let fixture: ComponentFixture<NotificacionCortesia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionCortesia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacionCortesia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
