import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortesiaList } from './cortesia-list';

describe('CortesiaList', () => {
  let component: CortesiaList;
  let fixture: ComponentFixture<CortesiaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortesiaList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortesiaList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
