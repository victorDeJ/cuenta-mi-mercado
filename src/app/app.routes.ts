import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ExchangeRatePage } from './pages/exchange-rate-page/exchange-rate-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'exchange-rate',
    component: ExchangeRatePage
  }
];

