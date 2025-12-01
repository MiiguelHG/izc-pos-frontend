import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosDelete } from './servicios-delete';

describe('ServiciosDelete', () => {
  let component: ServiciosDelete;
  let fixture: ComponentFixture<ServiciosDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
