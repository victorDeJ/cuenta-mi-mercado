import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceriesList } from './groceries-list';

describe('GroceriesList', () => {
  let component: GroceriesList;
  let fixture: ComponentFixture<GroceriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceriesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroceriesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
