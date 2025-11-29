import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuseosDelete } from './museos-delete';

describe('MuseosDelete', () => {
  let component: MuseosDelete;
  let fixture: ComponentFixture<MuseosDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuseosDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuseosDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
