import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarOperador } from './sidebar';

describe('SidebarOperador', () => {
  let component: SidebarOperador;
  let fixture: ComponentFixture<SidebarOperador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarOperador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarOperador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

