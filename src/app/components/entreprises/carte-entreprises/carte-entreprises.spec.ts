import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteEntreprises } from './carte-entreprises';
import { provideTranslateService } from '@ngx-translate/core';

describe('CarteEntreprises', () => {
  let component: CarteEntreprises;
  let fixture: ComponentFixture<CarteEntreprises>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteEntreprises],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteEntreprises);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
