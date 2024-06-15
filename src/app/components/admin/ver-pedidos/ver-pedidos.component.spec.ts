import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPedidosComponent } from './ver-pedidos.component';

describe('VerPedidosComponent', () => {
  let component: VerPedidosComponent;
  let fixture: ComponentFixture<VerPedidosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerPedidosComponent]
    });
    fixture = TestBed.createComponent(VerPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
