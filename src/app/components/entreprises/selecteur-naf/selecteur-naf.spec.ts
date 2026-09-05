import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecteurNAF } from './selecteur-naf';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SelecteurNAF', () => {
  let component: SelecteurNAF;
  let fixture: ComponentFixture<SelecteurNAF>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurNAF],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurNAF);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      const testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/naf/json/NAFREV2.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush({
        'ACTIVITÉS EXTRA-TERRITORIALES': {
          'Activités des organisations et organismes extraterritoriaux': {
            'Activités des organisations et organismes extraterritoriaux': {
              '99.00': 'Activités des organisations et organismes extraterritoriaux',
            },
          },
        },
      });
    });

    it('WHEN #nafRev2 observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
      expect(component.nafRev2s()).toHaveLength(1);
    });
  });
});
