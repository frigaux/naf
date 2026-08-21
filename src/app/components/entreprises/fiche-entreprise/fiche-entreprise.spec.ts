import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FicheEntreprise } from './fiche-entreprise';

describe('FicheEntreprise', () => {
  let component: FicheEntreprise;
  let fixture: ComponentFixture<FicheEntreprise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheEntreprise],
    }).compileComponents();

    fixture = TestBed.createComponent(FicheEntreprise);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
