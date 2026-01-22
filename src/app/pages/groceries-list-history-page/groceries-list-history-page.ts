import { Component, inject } from '@angular/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-groceries-list-history-page',
  imports: [TranslateModule, NgClass],
  templateUrl: './groceries-list-history-page.html',
  styleUrl: './groceries-list-history-page.scss',
})
export class GroceriesListHistoryPage {
  layout = inject(Layout);

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST_HISTORY.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "GroceriesListHistory",
      label: "GROCERIES_LIST_HISTORY.BREADCRUMB_NAME",
      url: "/groceries-list-history"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);
  }
}
