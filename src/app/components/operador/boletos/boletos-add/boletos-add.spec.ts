import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosAdd } from './boletos-add';

describe('BoletosAdd', () => {
  let component: BoletosAdd;
  let fixture: ComponentFixture<BoletosAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
