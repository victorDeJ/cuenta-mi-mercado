import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ExchangeRatePage } from './pages/exchange-rate-page/exchange-rate-page';
import { GroceriesList } from './pages/groceries-list/groceries-list';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'exchange-rate',
    component: ExchangeRatePage
  },
  {
    path: 'groceries-list',
    component: GroceriesList
  }
];

