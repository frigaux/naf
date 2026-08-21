import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteEntreprises } from './carte-entreprises';

describe('CarteEntreprises', () => {
  let component: CarteEntreprises;
  let fixture: ComponentFixture<CarteEntreprises>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteEntreprises],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteEntreprises);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
