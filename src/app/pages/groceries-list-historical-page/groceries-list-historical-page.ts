import { Component, inject, signal } from '@angular/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { GroceryList } from '../../core/services/database/collections/grocery-list';

@Component({
  selector: 'app-groceries-list-historical-page',
  imports: [TranslateModule, NgClass, DatePipe, CurrencyPipe],
  templateUrl: './groceries-list-historical-page.html',
  styleUrl: './groceries-list-historical-page.scss',
})
export class GroceriesListHistoricalPage {
  layout = inject(Layout);
  db = inject(Database);

  groceryLists = signal<GroceryList[]>([]);

  async ngOnInit(): Promise<void> {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST_HISTORICAL.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "GroceriesListHistorical",
      label: "GROCERIES_LIST_HISTORICAL.BREADCRUMB_NAME",
      url: "/groceries-list-historical"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);

    await this.loadGroceryLists();
  }

  async loadGroceryLists() {
    try {
      const data = await this.db.getData(Collection.GROCERY_LIST);
      console.log('Loaded grocery lists:', data);
      const sortedLists = (data as GroceryList[]).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.groceryLists.set(sortedLists);
    } catch (error) {
      console.error('Error loading grocery lists:', error);
    }
  }
}
