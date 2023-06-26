import { TestBed } from '@angular/core/testing';

import { RSOServiceService } from './rsoservice.service';

describe('RSOServiceService', () => {
  let service: RSOServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RSOServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
