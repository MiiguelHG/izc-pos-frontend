import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosDelete } from './usuarios-delete';

describe('UsuariosDelete', () => {
  let component: UsuariosDelete;
  let fixture: ComponentFixture<UsuariosDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosDelete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosDelete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
