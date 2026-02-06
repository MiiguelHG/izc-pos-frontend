import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortesiaCreate } from './cortesia-create';

describe('CortesiaCreate', () => {
  let component: CortesiaCreate;
  let fixture: ComponentFixture<CortesiaCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortesiaCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortesiaCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
