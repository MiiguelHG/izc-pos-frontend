import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosVendidosAdmin } from './boletos-vendidos-admin';

describe('BoletosVendidosAdmin', () => {
  let component: BoletosVendidosAdmin;
  let fixture: ComponentFixture<BoletosVendidosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosVendidosAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosVendidosAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
