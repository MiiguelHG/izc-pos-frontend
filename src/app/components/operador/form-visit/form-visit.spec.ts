import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVisit } from './form-visit';

describe('FormVisit', () => {
  let component: FormVisit;
  let fixture: ComponentFixture<FormVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormVisit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormVisit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
