import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entreprises } from './entreprises';
import { provideTranslateService } from '@ngx-translate/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Entreprises', () => {
  let component: Entreprises;
  let fixture: ComponentFixture<Entreprises>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entreprises],
      providers: [provideTranslateService(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Entreprises);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      let testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/naf/json/communesFrance2026.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush([]);
      testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/naf/json/NAFREV2.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush({});
    });

    it('WHEN observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
    });
  });
});
