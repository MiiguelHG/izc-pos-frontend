import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosCreate } from './boletos-create';

describe('BoletosCreate', () => {
  let component: BoletosCreate;
  let fixture: ComponentFixture<BoletosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
