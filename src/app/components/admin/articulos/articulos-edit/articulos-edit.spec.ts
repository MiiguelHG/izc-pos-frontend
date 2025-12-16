import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulosEdit } from './articulos-edit';

describe('ArticulosEdit', () => {
  let component: ArticulosEdit;
  let fixture: ComponentFixture<ArticulosEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticulosEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticulosEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
