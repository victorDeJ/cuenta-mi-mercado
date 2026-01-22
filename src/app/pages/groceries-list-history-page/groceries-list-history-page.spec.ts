import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceriesListHistoryPage } from './groceries-list-history-page';

describe('GroceriesListHistoryPage', () => {
  let component: GroceriesListHistoryPage;
  let fixture: ComponentFixture<GroceriesListHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroceriesListHistoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroceriesListHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
