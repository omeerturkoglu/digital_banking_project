import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyExchange } from './currency-exchange';

describe('CurrencyExchange', () => {
  let component: CurrencyExchange;
  let fixture: ComponentFixture<CurrencyExchange>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyExchange],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyExchange);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
