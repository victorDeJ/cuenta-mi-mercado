import { Component, inject } from '@angular/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-groceries-list-historical-page',
  imports: [TranslateModule, NgClass],
  templateUrl: './groceries-list-historical-page.html',
  styleUrl: './groceries-list-historical-page.scss',
})
export class GroceriesListHistoricalPage {
  layout = inject(Layout);

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST_HISTORICAL.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "GroceriesListHistorical",
      label: "GROCERIES_LIST_HISTORICAL.BREADCRUMB_NAME",
      url: "/groceries-list-historical"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);
  }
}
