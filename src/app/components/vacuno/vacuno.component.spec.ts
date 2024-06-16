import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacunoComponent } from './vacuno.component';

describe('VacunoComponent', () => {
  let component: VacunoComponent;
  let fixture: ComponentFixture<VacunoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VacunoComponent]
    });
    fixture = TestBed.createComponent(VacunoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
