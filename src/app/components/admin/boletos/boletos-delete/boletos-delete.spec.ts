import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosDelete } from './boletos-delete';

describe('BoletosDelete', () => {
  let component: BoletosDelete;
  let fixture: ComponentFixture<BoletosDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
