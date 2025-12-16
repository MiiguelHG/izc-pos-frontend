import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulosCreate } from './articulos-create';

describe('ArticulosCreate', () => {
  let component: ArticulosCreate;
  let fixture: ComponentFixture<ArticulosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticulosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticulosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
