import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarMisDatosComponent } from './gestionar-mis-datos.component';

describe('GestionarMisDatosComponent', () => {
  let component: GestionarMisDatosComponent;
  let fixture: ComponentFixture<GestionarMisDatosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionarMisDatosComponent]
    });
    fixture = TestBed.createComponent(GestionarMisDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
