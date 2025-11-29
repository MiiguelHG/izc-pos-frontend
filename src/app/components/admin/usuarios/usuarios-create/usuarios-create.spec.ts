import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosCreate } from './usuarios-create';

describe('UsuariosCreate', () => {
  let component: UsuariosCreate;
  let fixture: ComponentFixture<UsuariosCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
