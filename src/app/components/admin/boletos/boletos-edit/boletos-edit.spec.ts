import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosEdit } from './boletos-edit';

describe('BoletosEdit', () => {
  let component: BoletosEdit;
  let fixture: ComponentFixture<BoletosEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
