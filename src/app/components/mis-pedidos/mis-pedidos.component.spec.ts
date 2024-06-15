import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPedidosComponent } from './mis-pedidos.component';

describe('MisPedidosComponent', () => {
  let component: MisPedidosComponent;
  let fixture: ComponentFixture<MisPedidosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MisPedidosComponent]
    });
    fixture = TestBed.createComponent(MisPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
