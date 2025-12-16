import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulosList } from './articulos-list';

describe('ArticulosList', () => {
  let component: ArticulosList;
  let fixture: ComponentFixture<ArticulosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticulosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticulosList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
