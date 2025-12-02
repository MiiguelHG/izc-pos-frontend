import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosCreate } from './servicios-create';

describe('ServiciosCreate', () => {
  let component: ServiciosCreate;
  let fixture: ComponentFixture<ServiciosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
