import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuseosEdit } from './museos-edit';

describe('MuseosEdit', () => {
  let component: MuseosEdit;
  let fixture: ComponentFixture<MuseosEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuseosEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuseosEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
