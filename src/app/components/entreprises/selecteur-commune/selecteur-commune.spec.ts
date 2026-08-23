import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelecteurCommune } from './selecteur-commune';

describe('SelecteurCommune', () => {
  let component: SelecteurCommune;
  let fixture: ComponentFixture<SelecteurCommune>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurCommune],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurCommune);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
