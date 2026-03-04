import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoletoInfo } from './boleto-info';

describe('BoletoInfo', () => {
  let component: BoletoInfo;
  let fixture: ComponentFixture<BoletoInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletoInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoletoInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
