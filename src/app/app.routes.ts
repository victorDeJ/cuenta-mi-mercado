import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ExchangeRatePage } from './pages/exchange-rate-page/exchange-rate-page';
import { GroceriesListPage } from './pages/groceries-list-page/groceries-list-page';
import { GroceriesListHistoricalPage } from './pages/groceries-list-historical-page/groceries-list-historical-page';
import { GroceriesListDetailPage } from './pages/groceries-list-detail-page/groceries-list-detail-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'home',
    component: HomePage
  },
  {
    path: 'exchange-rate',
    component: ExchangeRatePage
  },
  {
    path: 'groceries-list',
    component: GroceriesListPage
  },
  {
    path: 'groceries-list-historical',
    component: GroceriesListHistoricalPage
  },
  {
    path: 'groceries-list-detail/:id',
    component: GroceriesListDetailPage
  }
];

