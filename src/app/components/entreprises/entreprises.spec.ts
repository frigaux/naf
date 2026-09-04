import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Entreprises } from './entreprises';
import { provideTranslateService } from '@ngx-translate/core';

describe('Entreprises', () => {
  let component: Entreprises;
  let fixture: ComponentFixture<Entreprises>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Entreprises],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(Entreprises);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
