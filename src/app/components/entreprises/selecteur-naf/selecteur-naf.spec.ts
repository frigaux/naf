import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecteurNAF } from './selecteur-naf';

describe('SelecteurNAF', () => {
  let component: SelecteurNAF;
  let fixture: ComponentFixture<SelecteurNAF>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecteurNAF],
    }).compileComponents();

    fixture = TestBed.createComponent(SelecteurNAF);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
