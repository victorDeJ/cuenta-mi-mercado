import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRatePage } from './exchange-rate-page';

describe('ExchangeRatePage', () => {
  let component: ExchangeRatePage;
  let fixture: ComponentFixture<ExchangeRatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangeRatePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchangeRatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
