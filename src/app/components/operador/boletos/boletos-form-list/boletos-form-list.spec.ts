import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletosFormList } from './boletos-form-list';

describe('BoletosFormList', () => {
  let component: BoletosFormList;
  let fixture: ComponentFixture<BoletosFormList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletosFormList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletosFormList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
