import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortesiaEdit } from './cortesia-edit';

describe('CortesiaEdit', () => {
  let component: CortesiaEdit;
  let fixture: ComponentFixture<CortesiaEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortesiaEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortesiaEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
