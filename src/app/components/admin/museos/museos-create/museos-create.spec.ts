import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuseosCreate } from './museos-create';

describe('MuseosCreate', () => {
  let component: MuseosCreate;
  let fixture: ComponentFixture<MuseosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuseosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuseosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
