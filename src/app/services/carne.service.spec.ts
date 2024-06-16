import { TestBed } from '@angular/core/testing';

import { CarneService } from './carne.service';

describe('CarneService', () => {
  let service: CarneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
